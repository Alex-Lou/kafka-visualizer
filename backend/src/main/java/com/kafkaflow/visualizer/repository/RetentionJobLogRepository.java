package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobStatus;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface RetentionJobLogRepository extends JpaRepository<RetentionJobLog, Long> {

    Page<RetentionJobLog> findAllByOrderByStartedAtDesc(Pageable pageable);

    List<RetentionJobLog> findByJobTypeOrderByStartedAtDesc(JobType jobType);

    List<RetentionJobLog> findByStatusOrderByStartedAtDesc(JobStatus status);

    Optional<RetentionJobLog> findTopByJobTypeOrderByStartedAtDesc(JobType jobType);

    Optional<RetentionJobLog> findTopByJobTypeAndStatusOrderByStartedAtDesc(JobType jobType, JobStatus status);

    List<RetentionJobLog> findByStartedAtBetweenOrderByStartedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT new map(" +
            "COUNT(j) as totalJobs, " +
            "SUM(j.messagesProcessed) as totalProcessed, " +
            "SUM(j.messagesArchived) as totalArchived, " +
            "SUM(j.messagesDeleted) as totalDeleted, " +
            "SUM(j.bytesFreed) as totalBytesFreed) " +
            "FROM RetentionJobLog j " +
            "WHERE j.startedAt >= :since AND j.status = 'COMPLETED'")
    Map<String, Object> getJobStatsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(j) > 0 FROM RetentionJobLog j " +
            "WHERE j.jobType = :jobType AND j.status = 'STARTED'")
    boolean isJobRunning(@Param("jobType") JobType jobType);

    void deleteByStartedAtBefore(LocalDateTime cutoff);
}