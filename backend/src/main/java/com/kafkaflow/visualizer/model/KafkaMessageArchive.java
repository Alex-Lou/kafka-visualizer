package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "kafka_messages_archive")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KafkaMessageArchive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_id", nullable = false)
    private Long originalId;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(name = "topic_name", nullable = false)
    private String topicName;

    @Column(name = "connection_id")
    private Long connectionId;

    @Column(name = "connection_name")
    private String connectionName;

    @Column(name = "partition_num")
    private Integer partition;

    @Column(name = "offset_num")
    private Long offset;

    @Column(name = "msg_key", length = 500)
    private String messageKey;

    @Column(name = "msg_value", columnDefinition = "LONGTEXT")
    private String messageValue;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime originalTimestamp;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "headers_json", columnDefinition = "JSON")
    private Map<String, String> headers;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    @Builder.Default
    private MessageType messageType = MessageType.NORMAL;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "value_size")
    @Builder.Default
    private Integer valueSize = 0;

    @Column(name = "archived_at")
    @Builder.Default
    private LocalDateTime archivedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "archive_reason")
    @Builder.Default
    private ArchiveReason archiveReason = ArchiveReason.RETENTION;

    public enum MessageType {
        NORMAL, ERROR, WARNING, SYSTEM
    }

    public enum ArchiveReason {
        RETENTION, MANUAL, CLEANUP
    }

    public static KafkaMessageArchive fromMessage(KafkaMessage message, String topicName,
                                                  Long connectionId, String connectionName,
                                                  ArchiveReason reason) {
        // Calculer la taille si pas déjà définie ou si égale à 0
        Integer size = message.getValueSize();
        if (size == null || size == 0) {
            size = message.getValue() != null ? message.getValue().length() : 0;
        }

        return KafkaMessageArchive.builder()
                .originalId(message.getId())
                .topicId(message.getTopic().getId())
                .topicName(topicName)
                .connectionId(connectionId)
                .connectionName(connectionName)
                .partition(message.getPartition())
                .offset(message.getOffset())
                .messageKey(message.getKey())
                .messageValue(message.getValue())
                .originalTimestamp(message.getTimestamp())
                .headers(message.getHeadersAsMap())
                .messageType(message.getMessageType() != null ?
                        MessageType.valueOf(message.getMessageType().name()) : MessageType.NORMAL)
                .contentType(message.getContentType())
                .valueSize(size)
                .archivedAt(LocalDateTime.now())
                .archiveReason(reason)
                .build();
    }
}