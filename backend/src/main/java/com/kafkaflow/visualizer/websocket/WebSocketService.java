package com.kafkaflow.visualizer.websocket;

import com.kafkaflow.visualizer.dto.KafkaDto.DashboardStats;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.dto.KafkaDto.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    // ═══════════════════════════════════════════════════════════════════════
    // MESSAGES
    // ═══════════════════════════════════════════════════════════════════════

    public void broadcastNewMessage(MessageResponse message) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("NEW_MESSAGE")
                .payload(message)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/messages", wsMessage);
        messagingTemplate.convertAndSend("/topic/messages/" + message.getTopicName(), wsMessage);

        log.debug("Broadcasted new message for topic: {}", message.getTopicName());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONNECTIONS
    // ═══════════════════════════════════════════════════════════════════════

    public void broadcastConnectionStatus(Long connectionId, String status) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("CONNECTION_STATUS")
                .payload(new ConnectionStatusPayload(connectionId, status))
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/connections", wsMessage);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TOPICS
    // ═══════════════════════════════════════════════════════════════════════

    /** Ancien format - gardé pour compatibilité */
    public void broadcastTopicUpdate(Long topicId, String topicName, long messageCount) {
        broadcastTopicUpdate(topicId, topicName, messageCount, 0.0);
    }

    /** Nouveau format avec throughput */
    public void broadcastTopicUpdate(Long topicId, String topicName, long messageCount, double throughput) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("TOPIC_UPDATE")
                .payload(new TopicUpdatePayload(topicId, topicName, messageCount, throughput, LocalDateTime.now()))
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/topics", wsMessage);
        log.debug("Broadcasted topic update: {} - count: {}, throughput: {}/s", topicName, messageCount, throughput);
    }

    /** Métriques complètes d'un topic */
    public void broadcastTopicMetrics(TopicMetricsPayload metrics) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("TOPIC_METRICS")
                .payload(metrics)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/metrics", wsMessage);
        messagingTemplate.convertAndSend("/topic/metrics/" + metrics.topicId(), wsMessage);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FLOWS
    // ═══════════════════════════════════════════════════════════════════════

    public void broadcastFlowUpdate(Long diagramId, Object flowData) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("FLOW_UPDATE")
                .payload(flowData)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/flow/" + diagramId, wsMessage);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DASHBOARD - TEMPS RÉEL
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Broadcast les stats complètes du dashboard (toutes les 5s)
     * Inclut: connections, topics, consumers, messages historiques + temps réel
     */
    public void broadcastDashboardStats(DashboardStats stats) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("DASHBOARD_STATS")
                .payload(stats)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/dashboard/stats", wsMessage);
        log.trace("Broadcasted dashboard stats - msg/s: {}", stats.getMessagesPerSecond());
    }

    /**
     * Broadcast uniquement les métriques temps réel (toutes les 1s)
     * Plus léger, pour le throughput en temps réel du dashboard
     */
    public void broadcastRealTimeMetrics(RealTimeMetricsPayload payload) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("REALTIME_METRICS")
                .payload(payload)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/dashboard/realtime", wsMessage);
        log.trace("Broadcasted realtime metrics - msg/s: {}", payload.messagesPerSecond());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PAYLOADS (Records)
    // ═══════════════════════════════════════════════════════════════════════

    private record ConnectionStatusPayload(
            Long connectionId,
            String status
    ) {}

    public record TopicUpdatePayload(
            Long topicId,
            String topicName,
            long messageCount,
            double throughput,
            LocalDateTime lastMessageAt
    ) {}

    public record TopicMetricsPayload(
            Long topicId,
            String topicName,
            long messageCount,
            double throughputPerSecond,
            double throughputPerMinute,
            long messagesLastMinute,
            LocalDateTime lastMessageAt,
            boolean consumerActive
    ) {}

    public record RealTimeMetricsPayload(
            double messagesPerSecond,
            long messagesLastMinute,
            long messagesLastHour
    ) {}
}