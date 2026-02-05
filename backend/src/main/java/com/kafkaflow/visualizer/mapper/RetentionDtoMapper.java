package com.kafkaflow.visualizer.mapper;

import com.kafkaflow.visualizer.dto.RetentionDto.JobLogResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.PolicyResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.StatsResponse;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaMessageStats;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionPolicy;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static com.kafkaflow.visualizer.dto.RetentionDto.formatBytes;

@Component
@RequiredArgsConstructor
public class RetentionDtoMapper {

    private final KafkaTopicRepository topicRepository;
    private final KafkaConnectionRepository connectionRepository;

    public PolicyResponse toPolicyResponse(RetentionPolicy policy) {
        String topicName = null;
        String connectionName = null;

        if (policy.getTopicId() != null) {
            topicName = topicRepository.findById(policy.getTopicId())
                    .map(KafkaTopic::getName).orElse(null);
        }
        if (policy.getConnectionId() != null) {
            connectionName = connectionRepository.findById(policy.getConnectionId())
                    .map(KafkaConnection::getName).orElse(null);
        }

        return PolicyResponse.builder()
                .id(policy.getId())
                .topicId(policy.getTopicId())
                .topicName(topicName)
                .connectionId(policy.getConnectionId())
                .connectionName(connectionName)
                .policyName(policy.getPolicyName())
                .policyScope(policy.getPolicyScope())
                .hotRetentionHours(policy.getHotRetentionHours())
                .hotMaxMessages(policy.getHotMaxMessages())
                .hotMaxSizeMb(policy.getHotMaxSizeMb())
                .archiveEnabled(policy.getArchiveEnabled())
                .archiveRetentionDays(policy.getArchiveRetentionDays())
                .archiveCompress(policy.getArchiveCompress())
                .statsEnabled(policy.getStatsEnabled())
                .statsRetentionDays(policy.getStatsRetentionDays())
                .autoPurgeEnabled(policy.getAutoPurgeEnabled())
                .purgeBookmarked(policy.getPurgeBookmarked())
                .priority(policy.getPriority())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    public JobLogResponse toJobLogResponse(RetentionJobLog log) {
        return JobLogResponse.builder()
                .id(log.getId())
                .jobType(log.getJobType() != null ? log.getJobType().name() : null)
                .status(log.getStatus() != null ? log.getStatus().name() : null)
                .messagesProcessed(log.getMessagesProcessed())
                .messagesArchived(log.getMessagesArchived())
                .messagesDeleted(log.getMessagesDeleted())

                .startedAt(log.getStartedAt())
                .completedAt(log.getCompletedAt())
                .durationMs(log.getDurationMs())

                .bytesFreed(log.getBytesFreed())
                .bytesFreedFormatted(formatBytes(log.getBytesFreed() != null ? log.getBytesFreed() : 0))

                .errorMessage(log.getErrorMessage())
                .build();
    }

    public StatsResponse toStatsResponse(KafkaMessageStats stats) {
        return StatsResponse.builder()
                .topicId(stats.getTopicId())
                .hourBucket(stats.getHourBucket())
                .messageCount(stats.getMessageCount())

                .normalCount(stats.getNormalCount())
                .errorCount(stats.getErrorCount())
                .warningCount(stats.getWarningCount())
                .systemCount(stats.getSystemCount())

                .totalSizeBytes(stats.getTotalSizeBytes())
                .avgSizeBytes(stats.getAvgSizeBytes())
                .minSizeBytes(stats.getMinSizeBytes())
                .maxSizeBytes(stats.getMaxSizeBytes())

                .messagesPerMinute(stats.getMessagesPerMinute() != null ? stats.getMessagesPerMinute().doubleValue() : 0.0)
                .peakMessagesPerMinute(stats.getPeakMessagesPerMinute())

                .firstMessageAt(stats.getFirstMessageAt())
                .lastMessageAt(stats.getLastMessageAt())
                .build();
    }
}