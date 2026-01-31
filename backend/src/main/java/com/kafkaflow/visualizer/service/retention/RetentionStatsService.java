package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RetentionStatsService {

    private final KafkaMessageRepository messageRepository;
    private final KafkaMessageStatsRepository statsRepository;
    private final RetentionPolicyRepository policyRepository;
    private final RetentionJobLogRepository jobLogRepository;
    private final KafkaTopicRepository topicRepository;
    private final RetentionPolicyService policyService;

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
                long messageCount = countMessagesInHour(topic.getId(), previousHour);

                if (messageCount == 0) {
                    continue;
                }

                KafkaMessageStats stats = statsRepository
                        .findByTopicIdAndHourBucket(topic.getId(), previousHour)
                        .orElse(KafkaMessageStats.createForHour(
                                topic.getId(), topic.getConnection().getId(), previousHour));

                updateStatsFromMessages(stats, topic.getId(), previousHour);
                statsRepository.save(stats);
                processed++;
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
            RetentionPolicy globalPolicy = policyRepository.findGlobalPolicy()
                    .orElse(policyService.createDefaultPolicy());
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

    private long countMessagesInHour(Long topicId, LocalDateTime hour) {
        return messageRepository.countByTopicIdAndTimestampBetween(
                topicId, hour, hour.plusHours(1));
    }

    private void updateStatsFromMessages(KafkaMessageStats stats, Long topicId, LocalDateTime hour) {
        List<KafkaMessage> messages = messageRepository.findByTopicIdAndTimestampBetween(
                topicId, hour, hour.plusHours(1));

        for (KafkaMessage msg : messages) {
            KafkaMessage.MessageType type = msg.getMessageType();
            MessageType archiveType = type != null
                    ? MessageType.valueOf(type.name())
                    : MessageType.NORMAL;
            stats.incrementMessageCount(
                    msg.getValueSize() != null ? msg.getValueSize() : 0,
                    archiveType);
        }
        stats.updateThroughput();
    }
}