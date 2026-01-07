package com.kafkaflow.visualizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class RetentionDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatePolicyRequest {
        private Long topicId;
        private Long connectionId;
        private String policyName;
        private Integer hotRetentionHours;
        private Integer hotMaxMessages;
        private Integer hotMaxSizeMb;
        private Boolean archiveEnabled;
        private Integer archiveRetentionDays;
        private Boolean archiveCompress;
        private Boolean statsEnabled;
        private Integer statsRetentionDays;
        private Boolean autoPurgeEnabled;
        private Boolean purgeBookmarked;
        private Integer priority;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdatePolicyRequest {
        private String policyName;
        private Integer hotRetentionHours;
        private Integer hotMaxMessages;
        private Integer hotMaxSizeMb;
        private Boolean archiveEnabled;
        private Integer archiveRetentionDays;
        private Boolean archiveCompress;
        private Boolean statsEnabled;
        private Integer statsRetentionDays;
        private Boolean autoPurgeEnabled;
        private Boolean purgeBookmarked;
        private Integer priority;
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurgeRequest {
        private Long topicId;
        private LocalDateTime olderThan;
        private boolean archiveFirst;
        private boolean includeArchives;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetTopicRequest {
        private boolean deleteArchives;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PolicyResponse {
        private Long id;
        private Long topicId;
        private String topicName;
        private Long connectionId;
        private String connectionName;
        private String policyName;
        private String policyScope;
        private Integer hotRetentionHours;
        private Integer hotMaxMessages;
        private Integer hotMaxSizeMb;
        private Boolean archiveEnabled;
        private Integer archiveRetentionDays;
        private Boolean archiveCompress;
        private Boolean statsEnabled;
        private Integer statsRetentionDays;
        private Boolean autoPurgeEnabled;
        private Boolean purgeBookmarked;
        private Integer priority;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StorageUsageResponse {
        private Long topicId;
        private String topicName;
        private Long connectionId;
        private String connectionName;
        private Long hotMessageCount;
        private Long hotSizeBytes;
        private String hotSizeFormatted;
        private LocalDateTime oldestHotMessage;
        private LocalDateTime newestHotMessage;
        private Long archiveMessageCount;
        private Long archiveSizeBytes;
        private String archiveSizeFormatted;
        private LocalDateTime oldestArchive;
        private LocalDateTime newestArchive;
        private Long totalMessageCount;
        private Long totalSizeBytes;
        private String totalSizeFormatted;
        private String effectivePolicyName;
        private Integer hotRetentionHours;
        private Integer archiveRetentionDays;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GlobalStorageResponse {
        private Long totalHotMessages;
        private Long totalHotSizeBytes;
        private String totalHotSizeFormatted;
        private Long totalArchiveMessages;
        private Long totalArchiveSizeBytes;
        private String totalArchiveSizeFormatted;
        private Long totalMessages;
        private Long totalSizeBytes;
        private String totalSizeFormatted;
        private LocalDateTime lastCleanupAt;
        private LocalDateTime nextCleanupAt;
        private List<StorageUsageResponse> topicUsages;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobLogResponse {
        private Long id;
        private String jobType;
        private String status;
        private Integer messagesProcessed;
        private Integer messagesArchived;
        private Integer messagesDeleted;
        private Long bytesFreed;
        private String bytesFreedFormatted;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private Integer durationMs;
        private String errorMessage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsResponse {
        private Long topicId;
        private String topicName;
        private LocalDateTime hourBucket;
        private Integer messageCount;
        private Integer normalCount;
        private Integer errorCount;
        private Integer warningCount;
        private Integer systemCount;
        private Long totalSizeBytes;
        private Integer avgSizeBytes;
        private Integer minSizeBytes;
        private Integer maxSizeBytes;
        private Double messagesPerMinute;
        private Integer peakMessagesPerMinute;
        private LocalDateTime firstMessageAt;
        private LocalDateTime lastMessageAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AggregatedStatsResponse {
        private Long topicId;
        private String topicName;
        private String timeRange;
        private Long totalMessages;
        private Long totalErrors;
        private Long totalWarnings;
        private Long totalSizeBytes;
        private String totalSizeFormatted;
        private Double avgThroughput;
        private Integer peakThroughput;
        private List<StatsResponse> hourlyBreakdown;
        private Map<String, Long> messagesByType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStatsResponse {
        private Long totalMessagesLast24h;
        private Long totalErrorsLast24h;
        private Long totalWarningsLast24h;
        private Double currentThroughput;
        private Long hotStorageSize;
        private Long archiveStorageSize;
        private List<TopicStatsResponse> topTopicsByVolume;
        private List<TopicStatsResponse> topTopicsByErrors;
        private List<HourlyDataPoint> throughputChart;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicStatsResponse {
        private Long topicId;
        private String topicName;
        private Long messageCount;
        private Long errorCount;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HourlyDataPoint {
        private LocalDateTime hour;
        private Long messageCount;
        private Long errorCount;
        private Double throughput;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArchiveMessageResponse {
        private Long id;
        private Long originalId;
        private Long topicId;
        private String topicName;
        private Long connectionId;
        private String connectionName;
        private Integer partitionNum;
        private Long offsetNum;
        private String msgKey;
        private String msgValue;
        private LocalDateTime timestamp;
        private Map<String, String> headers;
        private String messageType;
        private String contentType;
        private Integer valueSize;
        private LocalDateTime archivedAt;
        private String archiveReason;
    }

    public static String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}