package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.GlobalStorageResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.StorageUsageResponse;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionPolicy;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.kafkaflow.visualizer.dto.RetentionDto.formatBytes;

@Service
@RequiredArgsConstructor
@Slf4j
public class RetentionStorageService {

    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;
    private final KafkaMessageArchiveRepository archiveRepository;
    private final RetentionPolicyRepository policyRepository;
    private final RetentionJobLogRepository jobLogRepository;

    @Transactional(readOnly = true)
    public GlobalStorageResponse getGlobalStorage() {
        List<KafkaTopic> topics = topicRepository.findAll();

        long totalHotMessages = 0;
        long totalHotSize = 0; // Note: Si tu as un moyen de calculer la taille hot, ajoute-le ici
        long totalArchiveMessages = 0;
        long totalArchiveSize = 0;

        List<StorageUsageResponse> topicUsages = new ArrayList<>();

        for (KafkaTopic topic : topics) {
            long hotCount = messageRepository.countByTopicId(topic.getId());
            long archiveCount = archiveRepository.countByTopicId(topic.getId());
            Long archiveSize = archiveRepository.getTotalSizeByTopicId(topic.getId());
            long safeArchiveSize = archiveSize != null ? archiveSize : 0;

            totalHotMessages += hotCount;
            totalArchiveMessages += archiveCount;
            totalArchiveSize += safeArchiveSize;

            topicUsages.add(StorageUsageResponse.builder()
                    .topicId(topic.getId())
                    .topicName(topic.getName())
                    .connectionId(topic.getConnection().getId())
                    .connectionName(topic.getConnection().getName())
                    .hotMessageCount(hotCount)
                    .archiveMessageCount(archiveCount)
                    .archiveSizeBytes(safeArchiveSize)
                    .archiveSizeFormatted(formatBytes(safeArchiveSize))
                    .totalMessageCount(hotCount + archiveCount)
                    .build());
        }

        Optional<RetentionJobLog> lastCleanup = jobLogRepository
                .findTopByJobTypeAndStatusOrderByStartedAtDesc(
                        RetentionJobLog.JobType.ARCHIVE,
                        RetentionJobLog.JobStatus.COMPLETED);

        return GlobalStorageResponse.builder()
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
                .build();
    }

    @Transactional(readOnly = true)
    public StorageUsageResponse getTopicStorage(Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        long hotCount = messageRepository.countByTopicId(topicId);
        long archiveCount = archiveRepository.countByTopicId(topicId);
        Long archiveSize = archiveRepository.getTotalSizeByTopicId(topicId);
        long safeArchiveSize = archiveSize != null ? archiveSize : 0;

        LocalDateTime oldestArchive = null;
        LocalDateTime newestArchive = null;

        // Isolation de la logique "sale" de parsing d'objet
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

        return StorageUsageResponse.builder()
                .topicId(topic.getId())
                .topicName(topic.getName())
                .connectionId(topic.getConnection().getId())
                .connectionName(topic.getConnection().getName())
                .hotMessageCount(hotCount)
                .archiveMessageCount(archiveCount)
                .archiveSizeBytes(safeArchiveSize)
                .archiveSizeFormatted(formatBytes(safeArchiveSize))
                .oldestArchive(oldestArchive)
                .newestArchive(newestArchive)
                .totalMessageCount(hotCount + archiveCount)
                .effectivePolicyName(policy != null ? policy.getPolicyName() : "Default")
                .hotRetentionHours(policy != null ? policy.getHotRetentionHours() : 168)
                .archiveRetentionDays(policy != null ? policy.getArchiveRetentionDays() : 90)
                .build();
    }
}