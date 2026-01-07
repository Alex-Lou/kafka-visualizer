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

    /**
     * Archive old messages from HOT to COLD storage
     * Runs every hour at minute 5
     */
    @Scheduled(cron = "0 5 * * * *")
    @Transactional
    public void scheduledArchiveJob() {
        if (jobLogRepository.isJobRunning(JobType.ARCHIVE)) {
            log.info("Archive job already running, skipping");
            return;
        }

        log.info("Starting scheduled archive job");
        archiveOldMessages();
    }

    /**
     * Purge expired archives
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void scheduledPurgeArchiveJob() {
        if (jobLogRepository.isJobRunning(JobType.PURGE_ARCHIVE)) {
            log.info("Purge archive job already running, skipping");
            return;
        }

        log.info("Starting scheduled purge archive job");
        purgeExpiredArchives();
    }

    /**
     * Aggregate message statistics
     * Runs every hour at minute 0
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void scheduledStatsAggregationJob() {
        if (jobLogRepository.isJobRunning(JobType.STATS_AGGREGATE)) {
            log.info("Stats aggregation job already running, skipping");
            return;
        }

        log.info("Starting scheduled stats aggregation job");
        aggregateStats();
    }

    /**
     * Cleanup old stats
     * Runs daily at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void scheduledStatsCleanupJob() {
        log.info("Starting scheduled stats cleanup job");
        cleanupOldStats();
    }

    // =========================================================================
    // ARCHIVE OPERATIONS
    // =========================================================================

    /**
     * Archive old messages based on retention policies
     */
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

                // Find messages to archive (older than cutoff, not bookmarked unless policy allows)
                List<KafkaMessage> messagesToArchive = findMessagesToArchive(
                        topic.getId(), cutoff, policy.getPurgeBookmarked(), BATCH_SIZE);

                for (KafkaMessage message : messagesToArchive) {
                    KafkaMessageArchive archive = KafkaMessageArchive.fromMessage(
                            message,
                            topic.getName(),
                            topic.getConnection().getId(),
                            topic.getConnection().getName(),
                            ArchiveReason.RETENTION
                    );
                    archiveRepository.save(archive);

                    int size = message.getValueSize() != null ? message.getValueSize() : 0;
                    totalBytes += size;
                    totalArchived++;
                }

                // Delete archived messages from hot storage
                if (!messagesToArchive.isEmpty()) {
                    List<Long> ids = messagesToArchive.stream()
                            .map(KafkaMessage::getId)
                            .toList();
                    deleteMessagesByIds(ids);
                }
            }

            jobLog.incrementArchived(totalArchived, totalBytes);
            jobLog.complete();

            log.info("Archive job completed: {} messages archived, {} bytes freed",
                    totalArchived, totalBytes);

        } catch (Exception e) {
            log.error("Archive job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    /**
     * Purge expired archives based on retention policies
     */
    @Transactional
    public RetentionJobLog purgeExpiredArchives() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.PURGE_ARCHIVE);
        jobLogRepository.save(jobLog);

        try {
            // Get global policy for default retention
            RetentionPolicy globalPolicy = policyRepository.findGlobalPolicy()
                    .orElse(createDefaultPolicy());

            LocalDateTime cutoff = globalPolicy.getArchiveCutoffTime();

            // Delete expired archives
            int deleted = archiveRepository.deleteExpiredArchives(cutoff);

            jobLog.incrementDeleted(deleted, 0);
            jobLog.complete();

            log.info("Purge archive job completed: {} archives deleted", deleted);

        } catch (Exception e) {
            log.error("Purge archive job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    // =========================================================================
    // STATS OPERATIONS
    // =========================================================================

    /**
     * Aggregate message statistics by hour
     */
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
                // Get or create stats for the previous hour
                KafkaMessageStats stats = statsRepository
                        .findByTopicIdAndHourBucket(topic.getId(), previousHour)
                        .orElse(KafkaMessageStats.createForHour(
                                topic.getId(),
                                topic.getConnection().getId(),
                                previousHour));

                // Count messages for this hour
                long messageCount = countMessagesInHour(topic.getId(), previousHour);

                if (messageCount > 0) {
                    // Update stats with aggregated data
                    updateStatsFromMessages(stats, topic.getId(), previousHour);
                    statsRepository.save(stats);
                    processed++;
                }
            }

            jobLog.setMessagesProcessed(processed);
            jobLog.complete();

            log.info("Stats aggregation job completed: {} topics processed", processed);

        } catch (Exception e) {
            log.error("Stats aggregation job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    /**
     * Cleanup old stats based on retention
     */
    @Transactional
    public RetentionJobLog cleanupOldStats() {
        RetentionJobLog jobLog = RetentionJobLog.start(JobType.STATS_CLEANUP);
        jobLogRepository.save(jobLog);

        try {
            RetentionPolicy globalPolicy = policyRepository.findGlobalPolicy()
                    .orElse(createDefaultPolicy());

            LocalDateTime cutoff = globalPolicy.getStatsCutoffTime();

            int deleted = statsRepository.deleteOldStats(cutoff);

            jobLog.setMessagesDeleted(deleted);
            jobLog.complete();

            log.info("Stats cleanup job completed: {} stats records deleted", deleted);

        } catch (Exception e) {
            log.error("Stats cleanup job failed", e);
            jobLog.fail(e.getMessage());
        }

        return jobLogRepository.save(jobLog);
    }

    // =========================================================================
    // MANUAL OPERATIONS
    // =========================================================================

    /**
     * Manually archive all messages for a topic
     */
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
                        message,
                        topic.getName(),
                        topic.getConnection().getId(),
                        topic.getConnection().getName(),
                        ArchiveReason.MANUAL
                );
                archiveRepository.save(archive);
                messageRepository.delete(message);
                totalArchived++;
            }
        } while (!batch.isEmpty());

        log.info("Manually archived {} messages for topic {}", totalArchived, topic.getName());
        return totalArchived;
    }

    /**
     * Reset a topic (delete all messages without archiving)
     */
    @Transactional
    public int resetTopic(Long topicId, boolean deleteArchives) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        // Delete from hot storage
        int hotDeleted = deleteMessagesByTopicId(topicId);

        // Optionally delete archives
        int archiveDeleted = 0;
        if (deleteArchives) {
            archiveDeleted = archiveRepository.deleteByTopicId(topicId);
        }

        // Reset topic message count
        topic.setMessageCount(0L);
        topic.setLastMessageAt(null);
        topicRepository.save(topic);

        log.info("Reset topic {}: {} hot messages, {} archives deleted",
                topic.getName(), hotDeleted, archiveDeleted);

        return hotDeleted + archiveDeleted;
    }

    /**
     * Purge messages older than specified date
     */
    @Transactional
    public int purgeMessagesOlderThan(LocalDateTime cutoff, boolean archiveFirst) {
        if (archiveFirst) {
            // Archive first
            List<KafkaTopic> topics = topicRepository.findAll();
            for (KafkaTopic topic : topics) {
                List<KafkaMessage> messages = findMessagesToArchive(
                        topic.getId(), cutoff, false, Integer.MAX_VALUE);

                for (KafkaMessage message : messages) {
                    KafkaMessageArchive archive = KafkaMessageArchive.fromMessage(
                            message,
                            topic.getName(),
                            topic.getConnection().getId(),
                            topic.getConnection().getName(),
                            ArchiveReason.CLEANUP
                    );
                    archiveRepository.save(archive);
                }
            }
        }

        // Delete from hot storage
        return messageRepository.deleteOlderThan(cutoff);
    }

    /**
     * Bookmark a message (prevent from being purged)
     */
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
                .hotRetentionHours(168)  // 7 days
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
        // Custom query to find messages older than cutoff
        // This would need to be added to the repository
        Page<KafkaMessage> page = messageRepository.findByTopicId(
                topicId, PageRequest.of(0, limit));

        return page.getContent().stream()
                .filter(m -> m.getTimestamp().isBefore(cutoff))
                .filter(m -> includeBookmarked || !Boolean.TRUE.equals(m.getIsBookmarked()))
                .toList();
    }

    private void deleteMessagesByIds(List<Long> ids) {
        for (Long id : ids) {
            messageRepository.deleteById(id);
        }
    }

    private int deleteMessagesByTopicId(Long topicId) {
        List<KafkaMessage> messages = messageRepository.findTop100ByTopicIdOrderByTimestampDesc(topicId);
        int count = 0;
        while (!messages.isEmpty()) {
            for (KafkaMessage message : messages) {
                messageRepository.delete(message);
                count++;
            }
            messages = messageRepository.findTop100ByTopicIdOrderByTimestampDesc(topicId);
        }
        return count;
    }

    private long countMessagesInHour(Long topicId, LocalDateTime hour) {
        LocalDateTime start = hour;
        LocalDateTime end = hour.plusHours(1);
        // This would need a custom query
        return messageRepository.countByTopicId(topicId);
    }

    private void updateStatsFromMessages(KafkaMessageStats stats, Long topicId, LocalDateTime hour) {
        // Aggregate data for the hour
        // This is simplified - in production you'd want more efficient queries
        Page<KafkaMessage> messages = messageRepository.findByTopicId(
                topicId, PageRequest.of(0, 10000));

        for (KafkaMessage msg : messages) {
            if (msg.getTimestamp().isAfter(hour) && msg.getTimestamp().isBefore(hour.plusHours(1))) {
                KafkaMessage.MessageType type = msg.getMessageType();
                KafkaMessageArchive.MessageType archiveType = type != null ?
                        KafkaMessageArchive.MessageType.valueOf(type.name()) :
                        KafkaMessageArchive.MessageType.NORMAL;

                stats.incrementMessageCount(
                        msg.getValueSize() != null ? msg.getValueSize() : 0,
                        archiveType);
            }
        }

        stats.updateThroughput();
    }
}