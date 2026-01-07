package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Entity
@Table(name = "retention_job_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetentionJobLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.STARTED;

    @Column(name = "messages_processed")
    @Builder.Default
    private Integer messagesProcessed = 0;

    @Column(name = "messages_archived")
    @Builder.Default
    private Integer messagesArchived = 0;

    @Column(name = "messages_deleted")
    @Builder.Default
    private Integer messagesDeleted = 0;

    @Column(name = "bytes_freed")
    @Builder.Default
    private Long bytesFreed = 0L;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "JSON")
    private Map<String, Object> details;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public enum JobType {
        ARCHIVE, PURGE_HOT, PURGE_ARCHIVE, STATS_AGGREGATE, STATS_CLEANUP
    }

    public enum JobStatus {
        STARTED, COMPLETED, FAILED
    }

    public static RetentionJobLog start(JobType type) {
        return RetentionJobLog.builder()
                .jobType(type)
                .status(JobStatus.STARTED)
                .startedAt(LocalDateTime.now())
                .build();
    }

    public void complete() {
        this.status = JobStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.durationMs = (int) ChronoUnit.MILLIS.between(startedAt, completedAt);
    }

    public void fail(String errorMessage) {
        this.status = JobStatus.FAILED;
        this.completedAt = LocalDateTime.now();
        this.durationMs = (int) ChronoUnit.MILLIS.between(startedAt, completedAt);
        this.errorMessage = errorMessage;
    }

    public void incrementArchived(int count, long bytes) {
        this.messagesArchived += count;
        this.messagesProcessed += count;
        this.bytesFreed += bytes;
    }

    public void incrementDeleted(int count, long bytes) {
        this.messagesDeleted += count;
        this.messagesProcessed += count;
        this.bytesFreed += bytes;
    }
}