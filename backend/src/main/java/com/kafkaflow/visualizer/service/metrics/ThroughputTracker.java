package com.kafkaflow.visualizer.service.metrics;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class ThroughputTracker {

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTES - Fenêtres de temps
    // ═══════════════════════════════════════════════════════════════════════

    private static final Duration THROUGHPUT_WINDOW = KafkaConsumerConfig.THROUGHPUT_WINDOW;

    private static final Duration LAST_MINUTE_WINDOW = Duration.ofSeconds(60);

    private static final Duration LAST_HOUR_WINDOW = Duration.ofHours(1);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    private final Map<Long, Deque<Instant>> topicTimestamps = new ConcurrentHashMap<>();

    private final Map<Long, Deque<Instant>> topicTimestampsHourly = new ConcurrentHashMap<>();

    private final boolean hourlyTrackingEnabled;

    public ThroughputTracker() {
        this.hourlyTrackingEnabled = true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENREGISTREMENT DES MESSAGES
    // ═══════════════════════════════════════════════════════════════════════

    public void recordMessages(Long topicId, int count) {
        if (count <= 0) return;

        Instant now = Instant.now();

        Deque<Instant> timestamps = topicTimestamps.computeIfAbsent(
                topicId, k -> new ConcurrentLinkedDeque<>()
        );
        for (int i = 0; i < count; i++) {
            timestamps.addLast(now);
        }

        if (hourlyTrackingEnabled) {
            Deque<Instant> hourlyTimestamps = topicTimestampsHourly.computeIfAbsent(
                    topicId, k -> new ConcurrentLinkedDeque<>()
            );
            for (int i = 0; i < count; i++) {
                hourlyTimestamps.addLast(now);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTRIQUES PAR TOPIC
    // ═══════════════════════════════════════════════════════════════════════

    public double getThroughput(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null || timestamps.isEmpty()) {
            return 0.0;
        }

        cleanOldTimestamps(timestamps, THROUGHPUT_WINDOW);

        if (timestamps.isEmpty()) {
            return 0.0;
        }

        return (double) timestamps.size() / THROUGHPUT_WINDOW.getSeconds();
    }

    public long getMessagesInWindow(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps, THROUGHPUT_WINDOW);
        return timestamps.size();
    }

    public long getMessagesLastMinute(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps, LAST_MINUTE_WINDOW);
        return countInWindow(timestamps, LAST_MINUTE_WINDOW);
    }

    public long getMessagesLastHour(Long topicId) {
        if (!hourlyTrackingEnabled) {
            return -1;
        }

        Deque<Instant> timestamps = topicTimestampsHourly.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps, LAST_HOUR_WINDOW);
        return timestamps.size();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTRIQUES GLOBALES (agrégées tous topics)
    // ═══════════════════════════════════════════════════════════════════════

    public double getGlobalThroughput() {
        return topicTimestamps.keySet().stream()
                .mapToDouble(this::getThroughput)
                .sum();
    }

    public long getGlobalMessagesLastMinute() {
        return topicTimestamps.keySet().stream()
                .mapToLong(this::getMessagesLastMinute)
                .sum();
    }

    public long getGlobalMessagesLastHour() {
        if (!hourlyTrackingEnabled) {
            return -1;
        }
        return topicTimestampsHourly.keySet().stream()
                .mapToLong(this::getMessagesLastHour)
                .sum();
    }

    public Set<Long> getTrackedTopicIds() {
        return topicTimestamps.keySet();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GESTION DU CYCLE DE VIE
    // ═══════════════════════════════════════════════════════════════════════

    public void register(Long topicId) {
        topicTimestamps.putIfAbsent(topicId, new ConcurrentLinkedDeque<>());
        if (hourlyTrackingEnabled) {
            topicTimestampsHourly.putIfAbsent(topicId, new ConcurrentLinkedDeque<>());
        }
    }

    public void unregister(Long topicId) {
        topicTimestamps.remove(topicId);
        topicTimestampsHourly.remove(topicId);
    }

    public void cleanupAll() {
        topicTimestamps.values().forEach(ts -> cleanOldTimestamps(ts, THROUGHPUT_WINDOW));
        if (hourlyTrackingEnabled) {
            topicTimestampsHourly.values().forEach(ts -> cleanOldTimestamps(ts, LAST_HOUR_WINDOW));
        }
    }

    public boolean isHourlyTrackingEnabled() {
        return hourlyTrackingEnabled;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private void cleanOldTimestamps(Deque<Instant> timestamps, Duration window) {
        Instant cutoff = Instant.now().minus(window);
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }
    }

    private long countInWindow(Deque<Instant> timestamps, Duration window) {
        Instant cutoff = Instant.now().minus(window);
        return timestamps.stream()
                .filter(ts -> ts.isAfter(cutoff))
                .count();
    }
}