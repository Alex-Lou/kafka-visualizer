package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.RetentionJobLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RetentionScheduler {

    private final RetentionJobLogRepository jobLogRepository;
    private final RetentionArchiveService archiveService;
    private final RetentionStatsService statsService;

    @Scheduled(cron = "0 5 * * * *")
    public void scheduledArchiveJob() {
        if (jobLogRepository.isJobRunning(JobType.ARCHIVE)) {
            return;
        }
        archiveService.archiveOldMessages();
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledPurgeArchiveJob() {
        if (jobLogRepository.isJobRunning(JobType.PURGE_ARCHIVE)) {
            return;
        }
        archiveService.purgeExpiredArchives();
    }

    @Scheduled(cron = "0 0 * * * *")
    public void scheduledStatsAggregationJob() {
        if (jobLogRepository.isJobRunning(JobType.STATS_AGGREGATE)) {
            return;
        }
        statsService.aggregateStats();
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void scheduledStatsCleanupJob() {
        statsService.cleanupOldStats();
    }
}