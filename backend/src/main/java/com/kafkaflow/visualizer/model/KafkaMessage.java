package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kafka_messages", indexes = {
    @Index(name = "idx_message_topic", columnList = "topic_id"),
    @Index(name = "idx_message_timestamp", columnList = "timestamp"),
    @Index(name = "idx_message_key", columnList = "message_key")
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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (status == null) {
            status = MessageStatus.RECEIVED;
        }
    }

    public enum MessageDirection {
        INBOUND, OUTBOUND
    }

    public enum MessageStatus {
        RECEIVED, PROCESSED, ERROR, PENDING
    }
}
