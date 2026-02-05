package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobStatus;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RetentionJobLogRepository extends JpaRepository<RetentionJobLog, Long> {

    Page<RetentionJobLog> findByJobType(JobType jobType, Pageable pageable);

    Page<RetentionJobLog> findAllByOrderByStartedAtDesc(Pageable pageable);

    List<RetentionJobLog> findByStartedAtAfter(LocalDateTime since);

    default List<RetentionJobLog> getJobStatsSince(LocalDateTime since) {
        return findByStartedAtAfter(since);
    }

    Optional<RetentionJobLog> findTopByJobTypeAndStatusOrderByStartedAtDesc(JobType jobType, JobStatus status);

    boolean existsByJobTypeAndStatus(JobType jobType, JobStatus status);

    default boolean isJobRunning(JobType jobType) {
        return existsByJobTypeAndStatus(jobType, JobStatus.STARTED);
    }
}