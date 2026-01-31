package com.kafkaflow.visualizer.dto;

import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

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
        private String messageValuePreview;
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

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime fromDate;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime toDate;

        private MessageType messageType;
        private ArchiveReason archiveReason;
        private String contentType;
        private String searchQuery;

        // Defaults + validation
        @Builder.Default
        @Min(0)
        private int page = 0;

        @Builder.Default
        @Min(1) @Max(100)
        private int size = 20;

        @Builder.Default
        private String sortBy = "originalTimestamp";

        @Builder.Default
        @Pattern(regexp = "^(asc|desc)$", message = "Must be 'asc' or 'desc'")
        private String sortDirection = "desc";
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATS (inchangé - déjà bien)
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
        private List<Long> ids;
        private Long topicId;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime fromDate;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime toDate;

        @NotNull(message = "Export format is required")
        private ExportFormat format;

        @Builder.Default
        private boolean includeHeaders = true;

        @Builder.Default
        private boolean includeMetadata = true;

        private boolean compress;

        // Validation custom : au moins un critère de sélection
        @AssertTrue(message = "Must specify ids, topicId, or date range")
        private boolean isValidSelection() {
            return (ids != null && !ids.isEmpty())
                    || topicId != null
                    || (fromDate != null && toDate != null);
        }
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
        private Long topicId;
        private Long connectionId;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime olderThan;

        // Sécurité : empêcher suppression accidentelle de tout
        @AssertTrue(message = "Must specify at least one deletion criteria")
        private boolean isValidRequest() {
            return (ids != null && !ids.isEmpty())
                    || topicId != null
                    || connectionId != null
                    || olderThan != null;
        }
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
    // RESTORE
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RestoreRequest {
        @NotEmpty(message = "At least one archive ID is required")
        private List<Long> ids;

        @Builder.Default
        private boolean deleteAfterRestore = true;
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
    // FILTER OPTIONS (inchangé)
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExportQuickRequest {
        private List<Long> ids;
        private Long topicId;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime fromDate;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime toDate;

        @Builder.Default
        private boolean compress = false;

        public ExportRequest toExportRequest(ExportFormat format, boolean includeMetadata) {
            return ExportRequest.builder()
                    .ids(ids)
                    .topicId(topicId)
                    .fromDate(fromDate)
                    .toDate(toDate)
                    .format(format)
                    .includeHeaders(true)
                    .includeMetadata(includeMetadata)
                    .compress(compress)
                    .build();
        }
    }
}