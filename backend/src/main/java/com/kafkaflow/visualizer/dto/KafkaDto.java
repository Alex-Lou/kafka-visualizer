package com.kafkaflow.visualizer.dto;

import com.kafkaflow.visualizer.model.KafkaConnection.ConnectionStatus;
import com.kafkaflow.visualizer.model.KafkaMessage.MessageDirection;
import com.kafkaflow.visualizer.model.KafkaMessage.MessageStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class KafkaDto {

    // ═══════════════════════════════════════════════════════════════════════
    // CONNECTION
    // ═══════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════
    // TOPIC
    // ═══════════════════════════════════════════════════════════════════════

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
    public static class TopicCreateRequest {
        @NotBlank(message = "Topic name is required")
        private String name;

        @NotNull @Min(1)
        private Integer partitions;

        @NotNull @Min(1)
        private Short replicationFactor;

        private String description;
        private String color;

        @Builder.Default
        private boolean monitored = true;

        private Map<String, String> configs;
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
    // MESSAGE
    // ═══════════════════════════════════════════════════════════════════════

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

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime fromDate;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime toDate;

        private MessageDirection direction;
        private MessageStatus status;
        private Integer partition;

        @Builder.Default @Min(0)
        private int page = 0;

        @Builder.Default @Min(1) @Max(200)
        private int size = 50;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FLOW DIAGRAM
    // ═══════════════════════════════════════════════════════════════════════

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
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStats {
        private int totalConnections;
        private int activeConnections;
        private int totalTopics;
        private int monitoredTopics;
        private int activeConsumers;
        private int runningThreads;
        private double messagesPerSecond;
        private long messagesLastMinute;
        private long messagesLastHour;
        private long messagesLast24h;
        private long totalMessagesStored;
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

    // ═══════════════════════════════════════════════════════════════════════
    // SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN TOPICS
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