package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobStatus;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageRetentionService {

    private final KafkaMessageRepository messageRepository;
    private final KafkaMessageArchiveRepository archiveRepository;
    private final KafkaMessageStatsRepository statsRepository;
    private final RetentionPolicyRepository policyRepository;
    private final RetentionJobLogRepository jobLogRepository;
    private final KafkaTopicRepository topicRepository;

    private static final int BATCH_SIZE = 1000;

    // =========================================================================
    // SCHEDULED JOBS
    // =========================================================================

    @Scheduled(cron = "0 5 * * * *")
    @Transactional
    public void scheduledArchiveJob() {
        if (jobLogRepository.isJobRunning(JobType.ARCHIVE)) {
            return; // Job already running, skip silently
        }
        archiveOldMessages();
    }

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void scheduledPurgeArchiveJob() {
        if (jobLogRepository.isJobRunning(JobType.PURGE_ARCHIVE)) {
            return; // Job already running, skip silently
        }
        purgeExpiredArchives();
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void scheduledStatsAggregationJob() {
        if (jobLogRepository.isJobRunning(JobType.STATS_AGGREGATE)) {
            return; // Job already running, skip silently
        }
        aggregateStats();
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void scheduledStatsCleanupJob() {
        cleanupOldStats();
    }

    // =========================================================================
    // ARCHIVE OPERATIONS
    // =========================================================================

    @Transactional
    public RetentionJobLog archiveOldMessages() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.ARCHIVE);
        jobLogRepository.save(jobLog);

        try {
            List<KafkaTopic> topics = topicRepository.findAll();
            int totalArchived = 0;
            long totalBytes = 0;

            for (KafkaTopic topic : topics) {
                RetentionPolicy policy = getEffectivePolicy(topic.getId(),
                        topic.getConnection().getId());

                if (policy == null || !policy.getArchiveEnabled()) {
                    continue;
                }

                LocalDateTime cutoff = policy.getHotCutoffTime();
                List<KafkaMessage> messagesToArchive = findMessagesToArchive(
                        topic.getId(), cutoff, policy.getPurgeBookmarked(), BATCH_SIZE);

                for (KafkaMessage message : messagesToArchive) {
                    KafkaMessageArchive archive = KafkaMessageArchive.fromMessage(
                            message, topic.getName(), topic.getConnection().getId(),
                            topic.getConnection().getName(), ArchiveReason.RETENTION);
                    archiveRepository.save(archive);
                    totalBytes += message.getValueSize() != null ? message.getValueSize() : 0;
                    totalArchived++;
                }

                if (!messagesToArchive.isEmpty()) {
                    List<Long> ids = messagesToArchive.stream().map(KafkaMessage::getId).toList();
                    deleteMessagesByIds(ids);
                }
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
            RetentionPolicy globalPolicy = policyRepository.findGlobalPolicy().orElse(createDefaultPolicy());
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

    // =========================================================================
    // STATS OPERATIONS
    // =========================================================================

    @Transactional
    public RetentionJobLog aggregateStats() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.STATS_AGGREGATE);
        jobLogRepository.save(jobLog);

        try {
            LocalDateTime currentHour = LocalDateTime.now().truncatedTo(ChronoUnit.HOURS);
            LocalDateTime previousHour = currentHour.minusHours(1);
            List<KafkaTopic> topics = topicRepository.findAll();
            int processed = 0;

            for (KafkaTopic topic : topics) {
                KafkaMessageStats stats = statsRepository
                        .findByTopicIdAndHourBucket(topic.getId(), previousHour)
                        .orElse(KafkaMessageStats.createForHour(
                                topic.getId(), topic.getConnection().getId(), previousHour));

                long messageCount = countMessagesInHour(topic.getId(), previousHour);
                if (messageCount > 0) {
                    updateStatsFromMessages(stats, topic.getId(), previousHour);
                    statsRepository.save(stats);
                    processed++;
                }
            }

            jobLog.setMessagesProcessed(processed);
            jobLog.complete();

        } catch (Exception e) {
            log.error("Stats aggregation job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    @Transactional
    public RetentionJobLog cleanupOldStats() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.STATS_CLEANUP);
        jobLogRepository.save(jobLog);

        try {
            RetentionPolicy globalPolicy = policyRepository.findGlobalPolicy().orElse(createDefaultPolicy());
            LocalDateTime cutoff = globalPolicy.getStatsCutoffTime();
            int deleted = statsRepository.deleteOldStats(cutoff);
            jobLog.setMessagesDeleted(deleted);
            jobLog.complete();

        } catch (Exception e) {
            log.error("Stats cleanup job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    // =========================================================================
    // MANUAL OPERATIONS
    // =========================================================================

    @Transactional
    public int archiveTopicMessages(Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        int totalArchived = 0;
        List<KafkaMessage> batch;
        do {
            batch = messageRepository.findTop100ByTopicIdOrderByTimestampDesc(topicId);
            for (KafkaMessage message : batch) {
                KafkaMessageArchive archive = KafkaMessageArchive.fromMessage(
                        message, topic.getName(), topic.getConnection().getId(),
                        topic.getConnection().getName(), ArchiveReason.MANUAL);
                archiveRepository.save(archive);
                messageRepository.delete(message);
                totalArchived++;
            }
        } while (!batch.isEmpty());

        log.info("Manually archived {} messages for topic {}", totalArchived, topic.getName());
        return totalArchived;
    }
    
    @Transactional
    public int archiveSpecificMessages(List<Long> messageIds) {
        List<KafkaMessage> messages = messageRepository.findAllById(messageIds);
        int totalArchived = 0;
        for (KafkaMessage message : messages) {
            KafkaTopic topic = message.getTopic();
            KafkaMessageArchive archive = KafkaMessageArchive.fromMessage(
                    message, topic.getName(), topic.getConnection().getId(),
                    topic.getConnection().getName(), ArchiveReason.MANUAL);
            archiveRepository.save(archive);
            messageRepository.delete(message);
            totalArchived++;
        }
        log.info("Manually archived {} specific messages", totalArchived);
        return totalArchived;
    }
    
    @Transactional
    public int archiveTopics(List<Long> topicIds) {
        int totalArchived = 0;
        for (Long topicId : topicIds) {
            totalArchived += archiveTopicMessages(topicId);
        }
        log.info("Manually archived {} topics", topicIds.size());
        return totalArchived;
    }

    @Transactional
    public int resetTopic(Long topicId, boolean deleteArchives) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        int hotDeleted = deleteMessagesByTopicId(topicId);
        int archiveDeleted = 0;
        if (deleteArchives) {
            archiveDeleted = archiveRepository.deleteByTopicId(topicId);
        }
        topic.setMessageCount(0L);
        topic.setLastMessageAt(null);
        topicRepository.save(topic);
        log.info("Reset topic {}: {} hot messages, {} archives deleted",
                topic.getName(), hotDeleted, archiveDeleted);
        return hotDeleted + archiveDeleted;
    }

    @Transactional
    public int purgeMessagesOlderThan(LocalDateTime cutoff, boolean archiveFirst) {
        if (archiveFirst) {
            List<KafkaTopic> topics = topicRepository.findAll();
            for (KafkaTopic topic : topics) {
                List<KafkaMessage> messages = findMessagesToArchive(
                        topic.getId(), cutoff, false, Integer.MAX_VALUE);
                for (KafkaMessage message : messages) {
                    KafkaMessageArchive archive = KafkaMessageArchive.fromMessage(
                            message, topic.getName(), topic.getConnection().getId(),
                            topic.getConnection().getName(), ArchiveReason.CLEANUP);
                    archiveRepository.save(archive);
                }
            }
        }
        return messageRepository.deleteOlderThan(cutoff);
    }

    @Transactional
    public void bookmarkMessage(Long messageId, boolean bookmarked) {
        KafkaMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));
        message.setIsBookmarked(bookmarked);
        messageRepository.save(message);
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private RetentionPolicy getEffectivePolicy(Long topicId, Long connectionId) {
        return policyRepository.findEffectivePolicy(topicId, connectionId)
                .orElse(createDefaultPolicy());
    }

    private RetentionPolicy createDefaultPolicy() {
        return RetentionPolicy.builder()
                .hotRetentionHours(168)
                .hotMaxMessages(100000)
                .archiveEnabled(true)
                .archiveRetentionDays(90)
                .statsEnabled(true)
                .statsRetentionDays(365)
                .autoPurgeEnabled(true)
                .purgeBookmarked(false)
                .build();
    }

    private List<KafkaMessage> findMessagesToArchive(Long topicId, LocalDateTime cutoff,
                                                     boolean includeBookmarked, int limit) {
        Page<KafkaMessage> page = messageRepository.findByTopicId(
                topicId, PageRequest.of(0, limit));
        return page.getContent().stream()
                .filter(m -> m.getTimestamp().isBefore(cutoff))
                .filter(m -> includeBookmarked || !Boolean.TRUE.equals(m.getIsBookmarked()))
                .toList();
    }

    private void deleteMessagesByIds(List<Long> ids) {
        messageRepository.deleteAllById(ids);
    }

    private int deleteMessagesByTopicId(Long topicId) {
        return messageRepository.deleteByTopicId(topicId);
    }

    private long countMessagesInHour(Long topicId, LocalDateTime hour) {
        LocalDateTime start = hour;
        LocalDateTime end = hour.plusHours(1);
        return messageRepository.countByTopicIdAndTimestampBetween(topicId, start, end);
    }

    private void updateStatsFromMessages(KafkaMessageStats stats, Long topicId, LocalDateTime hour) {
        List<KafkaMessage> messages = messageRepository.findByTopicIdAndTimestampBetween(
                topicId, hour, hour.plusHours(1));
        for (KafkaMessage msg : messages) {
            KafkaMessage.MessageType type = msg.getMessageType();
            KafkaMessageArchive.MessageType archiveType = type != null ?
                    KafkaMessageArchive.MessageType.valueOf(type.name()) :
                    KafkaMessageArchive.MessageType.NORMAL;
            stats.incrementMessageCount(
                    msg.getValueSize() != null ? msg.getValueSize() : 0,
                    archiveType);
        }
        stats.updateThroughput();
    }
}