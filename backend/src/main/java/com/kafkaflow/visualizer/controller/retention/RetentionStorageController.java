package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

import static com.kafkaflow.visualizer.dto.RetentionDto.formatBytes;

@RestController
@RequestMapping("/api/retention/storage")
@RequiredArgsConstructor
@Slf4j
public class RetentionStorageController {

    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;
    private final KafkaMessageArchiveRepository archiveRepository;
    private final RetentionPolicyRepository policyRepository;
    private final RetentionJobLogRepository jobLogRepository;

    @GetMapping
    public ResponseEntity<GlobalStorageResponse> getGlobalStorage() {
        List<KafkaTopic> topics = topicRepository.findAll();

        long totalHotMessages = 0;
        long totalHotSize = 0;
        long totalArchiveMessages = 0;
        long totalArchiveSize = 0;

        List<StorageUsageResponse> topicUsages = new ArrayList<>();

        for (KafkaTopic topic : topics) {
            long hotCount = messageRepository.countByTopicId(topic.getId());
            long archiveCount = archiveRepository.countByTopicId(topic.getId());
            Long archiveSize = archiveRepository.getTotalSizeByTopicId(topic.getId());

            totalHotMessages += hotCount;
            totalArchiveMessages += archiveCount;
            totalArchiveSize += archiveSize != null ? archiveSize : 0;

            topicUsages.add(StorageUsageResponse.builder()
                    .topicId(topic.getId())
                    .topicName(topic.getName())
                    .connectionId(topic.getConnection().getId())
                    .connectionName(topic.getConnection().getName())
                    .hotMessageCount(hotCount)
                    .archiveMessageCount(archiveCount)
                    .archiveSizeBytes(archiveSize != null ? archiveSize : 0)
                    .archiveSizeFormatted(formatBytes(archiveSize != null ? archiveSize : 0))
                    .totalMessageCount(hotCount + archiveCount)
                    .build());
        }

        Optional<RetentionJobLog> lastCleanup = jobLogRepository
                .findTopByJobTypeAndStatusOrderByStartedAtDesc(
                        RetentionJobLog.JobType.ARCHIVE,
                        RetentionJobLog.JobStatus.COMPLETED);

        return ResponseEntity.ok(GlobalStorageResponse.builder()
                .totalHotMessages(totalHotMessages)
                .totalHotSizeBytes(totalHotSize)
                .totalHotSizeFormatted(formatBytes(totalHotSize))
                .totalArchiveMessages(totalArchiveMessages)
                .totalArchiveSizeBytes(totalArchiveSize)
                .totalArchiveSizeFormatted(formatBytes(totalArchiveSize))
                .totalMessages(totalHotMessages + totalArchiveMessages)
                .totalSizeBytes(totalHotSize + totalArchiveSize)
                .totalSizeFormatted(formatBytes(totalHotSize + totalArchiveSize))
                .lastCleanupAt(lastCleanup.map(RetentionJobLog::getCompletedAt).orElse(null))
                .topicUsages(topicUsages)
                .build());
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<StorageUsageResponse> getTopicStorage(@PathVariable Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        long hotCount = messageRepository.countByTopicId(topicId);
        long archiveCount = archiveRepository.countByTopicId(topicId);
        Long archiveSize = archiveRepository.getTotalSizeByTopicId(topicId);

        LocalDateTime oldestArchive = null;
        LocalDateTime newestArchive = null;

        try {
            Object archiveStatsRaw = archiveRepository.getArchiveStatsByTopicId(topicId);

            if (archiveStatsRaw instanceof Object[] statsArray && statsArray.length >= 6) {
                oldestArchive = (LocalDateTime) statsArray[4];
                newestArchive = (LocalDateTime) statsArray[5];
            }
        } catch (Exception e) {
            log.warn("Failed to get archive stats for topic {}: {}", topicId, e.getMessage());
        }

        RetentionPolicy policy = policyRepository
                .findEffectivePolicy(topicId, topic.getConnection().getId())
                .orElse(null);

        return ResponseEntity.ok(StorageUsageResponse.builder()
                .topicId(topic.getId())
                .topicName(topic.getName())
                .connectionId(topic.getConnection().getId())
                .connectionName(topic.getConnection().getName())
                .hotMessageCount(hotCount)
                .archiveMessageCount(archiveCount)
                .archiveSizeBytes(archiveSize != null ? archiveSize : 0)
                .archiveSizeFormatted(formatBytes(archiveSize != null ? archiveSize : 0))
                .oldestArchive(oldestArchive)
                .newestArchive(newestArchive)
                .totalMessageCount(hotCount + archiveCount)
                .effectivePolicyName(policy != null ? policy.getPolicyName() : "Default")
                .hotRetentionHours(policy != null ? policy.getHotRetentionHours() : 168)
                .archiveRetentionDays(policy != null ? policy.getArchiveRetentionDays() : 90)
                .build());
    }
}