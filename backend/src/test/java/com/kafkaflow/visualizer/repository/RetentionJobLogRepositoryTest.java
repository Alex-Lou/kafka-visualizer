package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobStatus;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class RetentionJobLogRepositoryTest {

    @Autowired
    private RetentionJobLogRepository repository;

    @Test
    void shouldFindLogsByJobType() {
        // GIVEN
        RetentionJobLog log1 = RetentionJobLog.builder()
                .jobType(JobType.ARCHIVE)
                .status(JobStatus.COMPLETED)
                .startedAt(LocalDateTime.now())
                .build();

        RetentionJobLog log2 = RetentionJobLog.builder()
                .jobType(JobType.PURGE_HOT) // Autre type
                .status(JobStatus.COMPLETED)
                .startedAt(LocalDateTime.now())
                .build();

        repository.save(log1);
        repository.save(log2);

        // WHEN
        Page<RetentionJobLog> result = repository.findByJobType(
                JobType.ARCHIVE,
                PageRequest.of(0, 10)
        );

        // THEN
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getJobType()).isEqualTo(JobType.ARCHIVE);
    }

    @Test
    void shouldCheckIfJobIsRunning() {
        // GIVEN
        RetentionJobLog runningJob = RetentionJobLog.builder()
                .jobType(JobType.STATS_AGGREGATE)
                .status(JobStatus.STARTED) // Job en cours
                .startedAt(LocalDateTime.now())
                .build();

        repository.save(runningJob);

        // WHEN / THEN
        // Test de la méthode par défaut "isJobRunning" qui appelle "existsBy..."
        boolean isRunning = repository.isJobRunning(JobType.STATS_AGGREGATE);
        boolean isOtherRunning = repository.isJobRunning(JobType.ARCHIVE);

        assertThat(isRunning).isTrue();
        assertThat(isOtherRunning).isFalse();
    }

    @Test
    void shouldFindLastCompletedJob() {
        // GIVEN
        RetentionJobLog oldJob = RetentionJobLog.builder()
                .jobType(JobType.ARCHIVE)
                .status(JobStatus.COMPLETED)
                .startedAt(LocalDateTime.now().minusDays(1))
                .build();

        RetentionJobLog newJob = RetentionJobLog.builder()
                .jobType(JobType.ARCHIVE)
                .status(JobStatus.COMPLETED)
                .startedAt(LocalDateTime.now())
                .build();

        repository.save(oldJob);
        repository.save(newJob);

        // WHEN
        Optional<RetentionJobLog> lastJob = repository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                JobType.ARCHIVE,
                JobStatus.COMPLETED
        );

        // THEN
        assertThat(lastJob).isPresent();
        assertThat(lastJob.get().getStartedAt()).isEqualTo(newJob.getStartedAt());
    }
}