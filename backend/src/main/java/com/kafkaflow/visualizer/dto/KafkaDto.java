package com.kafkaflow.visualizer.dto;

import com.kafkaflow.visualizer.model.KafkaConnection.ConnectionStatus;
import com.kafkaflow.visualizer.model.KafkaMessage.MessageDirection;
import com.kafkaflow.visualizer.model.KafkaMessage.MessageStatus;
import lombok.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class KafkaDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConnectionRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Bootstrap servers is required")
        private String bootstrapServers;

        private String description;
        private boolean defaultConnection;
        private String securityProtocol;
        private String saslMechanism;
        private String saslUsername;
        private String saslPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConnectionResponse {
        private Long id;
        private String name;
        private String bootstrapServers;
        private String description;
        private ConnectionStatus status;
        private boolean defaultConnection;
        private String securityProtocol;
        private LocalDateTime createdAt;
        private LocalDateTime lastConnectedAt;
        private int topicCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicResponse {
        private Long id;
        private String name;
        private Long connectionId;
        private String connectionName;
        private String connectionStatus;
        private Integer partitions;
        private Short replicationFactor;
        private String description;
        private String color;
        private boolean monitored;
        private Long messageCount;
        private LocalDateTime lastMessageAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicUpdateRequest {
        private String description;
        private String color;
        private boolean monitored;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageResponse {
        private Long id;
        private String topicName;
        private String key;
        private String value;
        private Integer partition;
        private Long offset;
        private LocalDateTime timestamp;
        private Map<String, String> headers;
        private MessageDirection direction;
        private MessageStatus status;
        private String sourceApplication;
        private String targetApplication;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageFilter {
        private Long topicId;
        private String key;
        private String valueContains;
        private LocalDateTime fromDate;
        private LocalDateTime toDate;
        private MessageDirection direction;
        private MessageStatus status;
        private Integer partition;
        private int page;
        private int size;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowDiagramRequest {
        @NotBlank(message = "Name is required")
        private String name;
        private String description;
        private Long connectionId;
        private String nodesJson;
        private String edgesJson;
        private String layoutJson;
        private boolean autoLayout;
        private boolean liveMode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowDiagramResponse {
        private Long id;
        private String name;
        private String description;
        private Long connectionId;
        private String connectionName;
        private String nodesJson;
        private String edgesJson;
        private String layoutJson;
        private boolean autoLayout;
        private boolean liveMode;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DASHBOARD STATS - Avec métriques temps réel
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStats {
        // ─────────────────────────────────────────────────────────────────────
        // CONNECTIONS
        // ─────────────────────────────────────────────────────────────────────
        private int totalConnections;
        private int activeConnections;

        // ─────────────────────────────────────────────────────────────────────
        // TOPICS
        // ─────────────────────────────────────────────────────────────────────
        private int totalTopics;
        private int monitoredTopics;

        // ─────────────────────────────────────────────────────────────────────
        // CONSUMERS
        // ─────────────────────────────────────────────────────────────────────
        private int activeConsumers;
        private int runningThreads;

        // ─────────────────────────────────────────────────────────────────────
        // MESSAGES - TEMPS RÉEL (fenêtre glissante en mémoire)
        // ─────────────────────────────────────────────────────────────────────
        /** Messages par seconde - agrégé tous topics monitorés */
        private double messagesPerSecond;

        /** Messages reçus dans la dernière minute (fenêtre 60s) */
        private long messagesLastMinute;

        /** Messages reçus dans la dernière heure (query DB) */
        private long messagesLastHour;

        // ─────────────────────────────────────────────────────────────────────
        // MESSAGES - HISTORIQUE (depuis DB)
        // ─────────────────────────────────────────────────────────────────────
        /** Messages des dernières 24h */
        private long messagesLast24h;

        /** Total de messages en base (pour info/debug) */
        private long totalMessagesStored;

        // ─────────────────────────────────────────────────────────────────────
        // DÉTAILS
        // ─────────────────────────────────────────────────────────────────────
        private List<TopicStats> topTopics;
        private List<MessageTrend> messageTrends;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicStats {
        private String topicName;
        private long messageCount;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageTrend {
        private String hour;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WebSocketMessage {
        private String type;
        private Object payload;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
        private LocalDateTime timestamp;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .data(data)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthStatus {
        private String status;
        private LocalDateTime timestamp;
        private String uptime;
        private String version;
        private ComponentHealth database;
        private ComponentHealth kafka;
        private ComponentHealth consumers;
        private Map<String, Object> metrics;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComponentHealth {
        private String status;
        private String message;
        private Map<String, Object> details;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicLiveStatsResponse {
        private Long topicId;
        private String topicName;
        private Long totalMessages;
        private Long messagesLast24h;
        private Long messagesLastHour;
        private Long errorCount;
        private Long warningCount;
        private Double throughputPerSecond;
        private Double throughputPerMinute;
        private Long totalSizeBytes;
        private String totalSizeFormatted;
        private LocalDateTime lastMessageAt;
        private LocalDateTime oldestMessageAt;
        private Boolean isMonitored;
        private Boolean consumerActive;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN TOPICS DTOs
    // ═══════════════════════════════════════════════════════════════════════

    public record OrphanDeleteRequest(List<Long> ids) {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrphanDeleteResponse {
        private int deleted;
        private int skipped;
        private String message;
    }
}