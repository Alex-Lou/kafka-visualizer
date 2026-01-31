package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RetentionArchiveService {

    private final KafkaMessageRepository messageRepository;
    private final KafkaMessageArchiveRepository archiveRepository;
    private final RetentionPolicyRepository policyRepository;
    private final RetentionJobLogRepository jobLogRepository;
    private final KafkaTopicRepository topicRepository;
    private final RetentionPolicyService policyService;

    private static final int BATCH_SIZE = 1000;

    @Transactional
    public RetentionJobLog archiveOldMessages() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.ARCHIVE);
        jobLogRepository.save(jobLog);

        try {
            List<KafkaTopic> topics = topicRepository.findAll();
            int totalArchived = 0;
            long totalBytes = 0;

            for (KafkaTopic topic : topics) {
                RetentionPolicy policy = policyService.getEffectivePolicy(
                        topic.getId(), topic.getConnection().getId());

                if (policy == null || !policy.getArchiveEnabled()) {
                    continue;
                }

                LocalDateTime cutoff = policy.getHotCutoffTime();
                List<KafkaMessage> messagesToArchive = messageRepository.findMessagesToArchive(
                        topic.getId(), cutoff, policy.getPurgeBookmarked(), PageRequest.of(0, BATCH_SIZE));

                if (messagesToArchive.isEmpty()) {
                    continue;
                }

                List<KafkaMessageArchive> archives = new ArrayList<>(messagesToArchive.size());
                List<Long> idsToDelete = new ArrayList<>(messagesToArchive.size());

                for (KafkaMessage message : messagesToArchive) {
                    archives.add(KafkaMessageArchive.fromMessage(
                            message, topic.getName(), topic.getConnection().getId(),
                            topic.getConnection().getName(), ArchiveReason.RETENTION));
                    totalBytes += message.getValueSize() != null ? message.getValueSize() : 0;
                    idsToDelete.add(message.getId());
                }

                archiveRepository.saveAll(archives);
                messageRepository.deleteAllById(idsToDelete);
                totalArchived += archives.size();
            }

            jobLog.incrementArchived(totalArchived, totalBytes);
            jobLog.complete();

        } catch (Exception e) {
            log.error("Archive job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    @Transactional
    public RetentionJobLog purgeExpiredArchives() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.PURGE_ARCHIVE);
        jobLogRepository.save(jobLog);

        try {
            RetentionPolicy globalPolicy = policyRepository.findGlobalPolicy()
                    .orElse(policyService.createDefaultPolicy());
            LocalDateTime cutoff = globalPolicy.getArchiveCutoffTime();
            int deleted = archiveRepository.deleteExpiredArchives(cutoff);

            jobLog.incrementDeleted(deleted, 0);
            jobLog.complete();

        } catch (Exception e) {
            log.error("Purge archive job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }
}