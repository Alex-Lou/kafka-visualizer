package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import com.kafkaflow.visualizer.service.metrics.ThroughputTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;
    private final ThroughputTracker throughputTracker;
    private final KafkaConsumerManager consumerManager;

    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastHour = now.minusHours(1);
        LocalDateTime last24Hours = now.minusHours(24);

        // ─────────────────────────────────────────────────────────────────────
        // MÉTRIQUES TEMPS RÉEL (depuis ThroughputTracker - en mémoire)
        // ─────────────────────────────────────────────────────────────────────

        double messagesPerSecond = roundTwoDecimals(throughputTracker.getGlobalThroughput());
        long messagesLastMinute = throughputTracker.getGlobalMessagesLastMinute();

        // Pour lastHour: utiliser la mémoire si disponible, sinon DB
        long messagesLastHour;
        if (throughputTracker.isHourlyTrackingEnabled()) {
            long fromMemory = throughputTracker.getGlobalMessagesLastHour();
            messagesLastHour = fromMemory >= 0 ? fromMemory : messageRepository.countMessagesSince(lastHour);
        } else {
            messagesLastHour = messageRepository.countMessagesSince(lastHour);
        }

        // ─────────────────────────────────────────────────────────────────────
        // MÉTRIQUES HISTORIQUES (depuis DB)
        // ─────────────────────────────────────────────────────────────────────

        long messagesLast24h = messageRepository.countMessagesSince(last24Hours);
        long totalMessagesStored = messageRepository.count();

        // ─────────────────────────────────────────────────────────────────────
        // CONNECTIONS
        // ─────────────────────────────────────────────────────────────────────

        int totalConnections = (int) connectionRepository.count();
        int activeConnections = connectionRepository.countActiveConnections();

        // ─────────────────────────────────────────────────────────────────────
        // TOPICS
        // ─────────────────────────────────────────────────────────────────────

        int totalTopics = (int) topicRepository.count();
        int monitoredTopics = topicRepository.countMonitoredTopics();

        // ─────────────────────────────────────────────────────────────────────
        // CONSUMERS
        // ─────────────────────────────────────────────────────────────────────

        int activeConsumers = consumerManager.getActiveConsumerCount();
        int runningThreads = (int) consumerManager.getConsumerStatus().values().stream()
                .filter("RUNNING"::equals)
                .count();

        // ─────────────────────────────────────────────────────────────────────
        // DÉTAILS (top topics + trends)
        // ─────────────────────────────────────────────────────────────────────

        List<TopicStats> topTopics = topicRepository.findTopByMessageCount(5).stream()
                .map(topic -> TopicStats.builder()
                        .topicName(topic.getName())
                        .messageCount(topic.getMessageCount())
                        .color(topic.getColor())
                        .build())
                .collect(Collectors.toList());

        List<MessageTrend> messageTrends = messageRepository.getMessageTrendsByHour(last24Hours).stream()
                .map(row -> MessageTrend.builder()
                        .hour(String.valueOf(row[0]))
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // ─────────────────────────────────────────────────────────────────────
        // BUILD RESPONSE
        // ─────────────────────────────────────────────────────────────────────

        return DashboardStats.builder()
                // Connections
                .totalConnections(totalConnections)
                .activeConnections(activeConnections)
                // Topics
                .totalTopics(totalTopics)
                .monitoredTopics(monitoredTopics)
                // Consumers
                .activeConsumers(activeConsumers)
                .runningThreads(runningThreads)
                // Messages - Temps réel
                .messagesPerSecond(messagesPerSecond)
                .messagesLastMinute(messagesLastMinute)
                .messagesLastHour(messagesLastHour)
                // Messages - Historique
                .messagesLast24h(messagesLast24h)
                .totalMessagesStored(totalMessagesStored)
                // Détails
                .topTopics(topTopics)
                .messageTrends(messageTrends)
                .build();
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}