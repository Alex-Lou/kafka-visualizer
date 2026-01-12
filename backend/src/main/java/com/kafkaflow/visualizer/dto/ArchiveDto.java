package com.kafkaflow.visualizer.dto;

import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ArchiveDto {

    // ═══════════════════════════════════════════════════════════════════════
    // ARCHIVE RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArchiveResponse {
        private Long id;
        private Long topicId;
        private String topicName;
        private Long connectionId;
        private String connectionName;
        private String messageKey;
        private String messageValue;
        private String messageValuePreview; // Truncated for list view
        private Integer partition;
        private Long offset;
        private LocalDateTime originalTimestamp;
        private LocalDateTime archivedAt;
        private Map<String, String> headers;
        private MessageType messageType;
        private String contentType;
        private Integer valueSize;
        private String valueSizeFormatted;
        private ArchiveReason archiveReason;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FILTER REQUEST
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArchiveFilterRequest {
        private Long topicId;
        private Long connectionId;
        private String topicName;
        private String messageKey;
        private String valueContains;
        private LocalDateTime fromDate;
        private LocalDateTime toDate;
        private MessageType messageType;
        private ArchiveReason archiveReason;
        private String contentType;
        private String searchQuery; // Full text search
        private int page;
        private int size;
        private String sortBy;
        private String sortDirection;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArchiveStats {
        private long totalArchives;
        private long totalSizeBytes;
        private String totalSizeFormatted;
        private long archivedLast24h;
        private long archivedLast7d;
        private List<TopicArchiveStats> byTopic;
        private List<ConnectionArchiveStats> byConnection;
        private Map<MessageType, Long> byMessageType;
        private Map<ArchiveReason, Long> byArchiveReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicArchiveStats {
        private Long topicId;
        private String topicName;
        private long count;
        private long sizeBytes;
        private String sizeFormatted;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConnectionArchiveStats {
        private Long connectionId;
        private String connectionName;
        private long count;
        private long sizeBytes;
        private String sizeFormatted;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExportRequest {
        private List<Long> ids; // Specific IDs to export
        private Long topicId; // Or all from a topic
        private LocalDateTime fromDate;
        private LocalDateTime toDate;
        private ExportFormat format;
        private boolean includeHeaders;
        private boolean includeMetadata;
        private boolean compress; // Gzip compression
    }

    public enum ExportFormat {
        JSON, CSV, NDJSON
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExportResponse {
        private String filename;
        private String contentType;
        private long recordCount;
        private long sizeBytes;
        private byte[] data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BULK OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkDeleteRequest {
        private List<Long> ids;
        private Long topicId; // Delete all from topic
        private Long connectionId; // Delete all from connection
        private LocalDateTime olderThan; // Delete older than date
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkOperationResponse {
        private int affected;
        private String message;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESTORE (from archive to active)
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RestoreRequest {
        private List<Long> ids;
        private boolean deleteAfterRestore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RestoreResponse {
        private int restored;
        private int failed;
        private List<String> errors;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FILTER OPTIONS (for dropdowns)
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FilterOptions {
        private List<String> topicNames;
        private List<String> connectionNames;
        private List<String> contentTypes;
        private List<MessageType> messageTypes;
        private List<ArchiveReason> archiveReasons;
    }
}