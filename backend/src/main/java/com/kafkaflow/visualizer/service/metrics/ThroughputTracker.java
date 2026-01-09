package com.kafkaflow.visualizer.service.metrics;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Tracking du throughput par topic (messages/seconde)
 */
@Component
public class ThroughputTracker {

    private final Map<Long, Deque<Instant>> topicTimestamps = new ConcurrentHashMap<>();

    /**
     * Enregistre N messages reçus maintenant
     */
    public void recordMessages(Long topicId, int count) {
        Deque<Instant> timestamps = topicTimestamps.computeIfAbsent(topicId, k -> new ConcurrentLinkedDeque<>());
        Instant now = Instant.now();
        for (int i = 0; i < count; i++) {
            timestamps.addLast(now);
        }
    }

    /**
     * Calcule le throughput en messages/seconde (moyenne sur la fenêtre)
     */
    public double getThroughput(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null || timestamps.isEmpty()) {
            return 0.0;
        }

        cleanOldTimestamps(timestamps);

        if (timestamps.isEmpty()) {
            return 0.0;
        }

        return (double) timestamps.size() / KafkaConsumerConfig.THROUGHPUT_WINDOW.getSeconds();
    }

    /**
     * Nombre de messages dans la fenêtre de temps
     */
    public long getMessagesInWindow(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps);
        return timestamps.size();
    }

    /**
     * Initialise le tracking pour un topic
     */
    public void register(Long topicId) {
        topicTimestamps.putIfAbsent(topicId, new ConcurrentLinkedDeque<>());
    }

    /**
     * Supprime le tracking pour un topic
     */
    public void unregister(Long topicId) {
        topicTimestamps.remove(topicId);
    }

    /**
     * Nettoie les timestamps plus vieux que la fenêtre
     */
    private void cleanOldTimestamps(Deque<Instant> timestamps) {
        Instant cutoff = Instant.now().minus(KafkaConsumerConfig.THROUGHPUT_WINDOW);
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }
    }
}