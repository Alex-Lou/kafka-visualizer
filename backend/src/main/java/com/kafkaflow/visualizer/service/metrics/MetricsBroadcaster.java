package com.kafkaflow.visualizer.service.metrics;

import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.dto.KafkaDto.DashboardStats;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageTrend;
import com.kafkaflow.visualizer.dto.KafkaDto.TopicStats;
import com.kafkaflow.visualizer.model.FlowDiagram;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.FlowDiagramRepository;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.FlowDiagramService;
import com.kafkaflow.visualizer.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Broadcast des métriques via WebSocket
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MetricsBroadcaster {

    private final WebSocketService webSocketService;
    private final KafkaTopicRepository topicRepository;
    private final FlowDiagramRepository flowDiagramRepository;
    private final FlowDiagramService flowDiagramService;
    private final ThroughputTracker throughputTracker;

    // Repositories pour le dashboard (évite la dépendance circulaire avec DashboardService)
    private final KafkaConnectionRepository connectionRepository;
    private final KafkaMessageRepository messageRepository;

    // Cache pour les consumer status (injecté par KafkaConsumerManager)
    private volatile int activeConsumerCount = 0;
    private volatile Map<Long, String> consumerStatus = new ConcurrentHashMap<>();

    // ═══════════════════════════════════════════════════════════════════════
    // CONSUMER STATUS (appelé par KafkaConsumerManager)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Met à jour le cache des consumers (appelé par KafkaConsumerManager)
     */
    public void updateConsumerStatus(int activeCount, Map<Long, String> status) {
        this.activeConsumerCount = activeCount;
        this.consumerStatus = new ConcurrentHashMap<>(status);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DASHBOARD GLOBAL METRICS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Broadcast les métriques globales du dashboard (appelé périodiquement)
     * Calcule directement depuis les repositories pour éviter la dépendance circulaire
     */
    public void broadcastDashboardMetrics() {
        try {
            DashboardStats stats = buildDashboardStats();
            webSocketService.broadcastDashboardStats(stats);
        } catch (Exception e) {
            log.trace("Dashboard metrics broadcast failed: {}", e.getMessage());
        }
    }

    /**
     * Construit les stats du dashboard directement (sans passer par DashboardService)
     */
    private DashboardStats buildDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastHour = now.minusHours(1);
        LocalDateTime last24Hours = now.minusHours(24);

        // Métriques temps réel
        double messagesPerSecond = roundTwoDecimals(throughputTracker.getGlobalThroughput());
        long messagesLastMinute = throughputTracker.getGlobalMessagesLastMinute();

        long messagesLastHour;
        if (throughputTracker.isHourlyTrackingEnabled()) {
            long fromMemory = throughputTracker.getGlobalMessagesLastHour();
            messagesLastHour = fromMemory >= 0 ? fromMemory : messageRepository.countMessagesSince(lastHour);
        } else {
            messagesLastHour = messageRepository.countMessagesSince(lastHour);
        }

        // Métriques historiques
        long messagesLast24h = messageRepository.countMessagesSince(last24Hours);
        long totalMessagesStored = messageRepository.count();

        // Connections
        int totalConnections = (int) connectionRepository.count();
        int activeConnections = connectionRepository.countActiveConnections();

        // Topics
        int totalTopics = (int) topicRepository.count();
        int monitoredTopics = topicRepository.countMonitoredTopics();

        // Consumers (depuis le cache)
        int runningThreads = (int) consumerStatus.values().stream()
                .filter("RUNNING"::equals)
                .count();

        // Top topics
        List<TopicStats> topTopics = topicRepository.findTopByMessageCount(5).stream()
                .map(topic -> TopicStats.builder()
                        .topicName(topic.getName())
                        .messageCount(topic.getMessageCount())
                        .color(topic.getColor())
                        .build())
                .collect(Collectors.toList());

        // Trends
        List<MessageTrend> messageTrends = messageRepository.getMessageTrendsByHour(last24Hours).stream()
                .map(row -> MessageTrend.builder()
                        .hour(String.valueOf(row[0]))
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalConnections(totalConnections)
                .activeConnections(activeConnections)
                .totalTopics(totalTopics)
                .monitoredTopics(monitoredTopics)
                .activeConsumers(activeConsumerCount)
                .runningThreads(runningThreads)
                .messagesPerSecond(messagesPerSecond)
                .messagesLastMinute(messagesLastMinute)
                .messagesLastHour(messagesLastHour)
                .messagesLast24h(messagesLast24h)
                .totalMessagesStored(totalMessagesStored)
                .topTopics(topTopics)
                .messageTrends(messageTrends)
                .build();
    }

    /**
     * Broadcast uniquement les métriques temps réel (plus léger, plus fréquent)
     */
    public void broadcastRealTimeMetrics() {
        try {
            double messagesPerSecond = roundTwoDecimals(throughputTracker.getGlobalThroughput());
            long messagesLastMinute = throughputTracker.getGlobalMessagesLastMinute();
            long messagesLastHour = throughputTracker.getGlobalMessagesLastHour();

            var payload = new WebSocketService.RealTimeMetricsPayload(
                    messagesPerSecond,
                    messagesLastMinute,
                    messagesLastHour
            );

            webSocketService.broadcastRealTimeMetrics(payload);
        } catch (Exception e) {
            log.trace("Real-time metrics broadcast failed: {}", e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TOPIC METRICS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Broadcast les métriques complètes d'un topic
     */
    public void broadcastTopicMetrics(Long topicId) {
        findTopicWithConnection(topicId).ifPresent(topic -> {
            double throughput = throughputTracker.getThroughput(topicId);
            long messagesLastMinute = throughputTracker.getMessagesInWindow(topicId);
            long messageCount = Optional.ofNullable(topic.getMessageCount()).orElse(0L);

            var metrics = new WebSocketService.TopicMetricsPayload(
                    topicId,
                    topic.getName(),
                    messageCount,
                    roundTwoDecimals(throughput),
                    roundTwoDecimals(throughput * 60),
                    messagesLastMinute,
                    topic.getLastMessageAt(),
                    true
            );

            webSocketService.broadcastTopicMetrics(metrics);
            webSocketService.broadcastTopicUpdate(topicId, topic.getName(), messageCount, roundTwoDecimals(throughput));
        });
    }

    /**
     * Broadcast une mise à jour de topic (après réception de messages)
     */
    public void broadcastTopicUpdate(Long topicId) {
        findTopicWithConnection(topicId).ifPresent(topic -> {
            double throughput = throughputTracker.getThroughput(topicId);
            long messageCount = Optional.ofNullable(topic.getMessageCount()).orElse(0L);
            webSocketService.broadcastTopicUpdate(topicId, topic.getName(), messageCount, throughput);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FLOW UPDATES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Broadcast les mises à jour de flows liés à un topic
     */
    public void broadcastFlowUpdates(Long topicId) {
        findTopicWithConnection(topicId)
                .filter(topic -> topic.getConnection() != null)
                .ifPresent(topic -> {
                    Long connectionId = topic.getConnection().getId();
                    List<FlowDiagram> liveFlows = flowDiagramRepository.findByConnectionIdAndLiveModeTrueWithConnection(connectionId);

                    liveFlows.forEach(flow -> broadcastFlowUpdate(flow.getId()));
                });
    }

    /**
     * Broadcast un flow spécifique
     */
    public void broadcastFlowUpdate(Long flowId) {
        try {
            FlowDto.FlowDiagramResponse flowData = flowDiagramService.getFlowById(flowId);
            webSocketService.broadcastFlowUpdate(flowId, flowData);
        } catch (Exception e) {
            log.trace("Flow broadcast skipped [{}]: {}", flowId, e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private Optional<KafkaTopic> findTopicWithConnection(Long topicId) {
        return topicRepository.findByIdWithConnection(topicId);
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}