package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kafka_messages", indexes = {
        @Index(name = "idx_message_topic", columnList = "topic_id"),
        @Index(name = "idx_message_timestamp", columnList = "timestamp"),
        @Index(name = "idx_message_key", columnList = "message_key"),
        @Index(name = "idx_message_type", columnList = "message_type"),
        @Index(name = "idx_message_bookmarked", columnList = "is_bookmarked")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KafkaMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private KafkaTopic topic;

    @Column(name = "message_key")
    private String key;

    @Column(name = "message_value", columnDefinition = "LONGTEXT")
    private String value;

    @Column(name = "partition_number")
    private Integer partition;

    @Column(name = "offset_value")
    private Long offset;

    private LocalDateTime timestamp;

    @Column(length = 2000)
    private String headers;

    @Enumerated(EnumType.STRING)
    private MessageDirection direction;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private String sourceApplication;

    private String targetApplication;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    @Builder.Default
    private MessageType messageType = MessageType.NORMAL;

    @Column(name = "content_type", length = 100)
    @Builder.Default
    private String contentType = "unknown";

    @Column(name = "value_size")
    @Builder.Default
    private Integer valueSize = 0;

    @Column(name = "is_bookmarked")
    @Builder.Default
    private Boolean isBookmarked = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (status == null) {
            status = MessageStatus.RECEIVED;
        }
        if (messageType == null) {
            messageType = MessageType.NORMAL;
        }
        if (value != null && valueSize == null) {
            valueSize = value.length();
        }
        if (contentType == null || "unknown".equals(contentType)) {
            contentType = detectContentType(value);
        }
        if (messageType == MessageType.NORMAL && value != null) {
            messageType = detectMessageType(value);
        }
    }

    private String detectContentType(String value) {
        if (value == null || value.isEmpty()) {
            return "empty";
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            return "application/json";
        }
        if (trimmed.startsWith("<")) {
            return "application/xml";
        }
        if (trimmed.contains(",") && trimmed.contains("\n")) {
            return "text/csv";
        }
        return "text/plain";
    }

    private MessageType detectMessageType(String value) {
        if (value == null) return MessageType.NORMAL;
        String lower = value.toLowerCase();

        if (lower.contains("\"error\"") || lower.contains("\"exception\"") ||
                lower.contains("\"stacktrace\"") || lower.contains("\"status\":500") ||
                lower.contains("\"status\":\"error\"") || lower.contains("failed")) {
            return MessageType.ERROR;
        }

        if (lower.contains("\"warning\"") || lower.contains("\"warn\"") ||
                lower.contains("\"status\":\"warning\"")) {
            return MessageType.WARNING;
        }

        if (lower.contains("\"type\":\"system\"") || lower.contains("heartbeat") ||
                lower.contains("\"ping\"") || lower.contains("\"health\"")) {
            return MessageType.SYSTEM;
        }

        return MessageType.NORMAL;
    }

    public enum MessageDirection {
        INBOUND, OUTBOUND
    }

    public enum MessageStatus {
        RECEIVED, PROCESSED, ERROR, PENDING
    }

    public enum MessageType {
        NORMAL, ERROR, WARNING, SYSTEM
    }

    public java.util.Map<String, String> getHeadersAsMap() {
        if (headers == null || headers.isEmpty()) {
            return null;
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(headers, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}