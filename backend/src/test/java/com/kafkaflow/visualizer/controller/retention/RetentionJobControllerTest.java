package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobStatus;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.RetentionJobLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RetentionJobController.class)
@DisplayName("RetentionJobController Tests")
class RetentionJobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RetentionJobLogRepository jobLogRepository;

    // =========================================================================
    // TEST DATA BUILDERS
    // =========================================================================

    private RetentionJobLog createTestJobLog(Long id, JobType type, JobStatus status) {
        return RetentionJobLog.builder()
                .id(id)
                .jobType(type)
                .status(status)
                .messagesProcessed(100)
                .messagesArchived(50)
                .messagesDeleted(25)
                .bytesFreed(10240L)
                .startedAt(LocalDateTime.now().minusMinutes(5))
                .completedAt(LocalDateTime.now())
                .durationMs(300000)
                .build();
    }

    private RetentionJobLog createFailedJobLog(Long id, JobType type, String errorMessage) {
        return RetentionJobLog.builder()
                .id(id)
                .jobType(type)
                .status(JobStatus.FAILED)
                .messagesProcessed(0)
                .messagesArchived(0)
                .messagesDeleted(0)
                .bytesFreed(0L)
                .startedAt(LocalDateTime.now().minusMinutes(1))
                .completedAt(LocalDateTime.now())
                .durationMs(60000)
                .errorMessage(errorMessage)
                .build();
    }

    // =========================================================================
    // GET JOB LOGS
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/jobs")
    class GetJobLogs {

        @Test
        @DisplayName("Should return paginated job logs with default parameters")
        void shouldReturnPaginatedJobLogsWithDefaultParameters() throws Exception {
            // Given
            RetentionJobLog job1 = createTestJobLog(1L, JobType.ARCHIVE, JobStatus.COMPLETED);
            RetentionJobLog job2 = createTestJobLog(2L, JobType.PURGE_ARCHIVE, JobStatus.COMPLETED);
            RetentionJobLog job3 = createTestJobLog(3L, JobType.STATS_AGGREGATE, JobStatus.COMPLETED);

            Page<RetentionJobLog> page = new PageImpl<>(
                    List.of(job1, job2, job3),
                    PageRequest.of(0, 20),
                    3
            );

            given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class)))
                    .willReturn(page);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(3))
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.content[0].jobType").value("ARCHIVE"))
                    .andExpect(jsonPath("$.content[0].status").value("COMPLETED"))
                    .andExpect(jsonPath("$.content[1].jobType").value("PURGE_ARCHIVE"))
                    .andExpect(jsonPath("$.content[2].jobType").value("STATS_AGGREGATE"))
                    .andExpect(jsonPath("$.totalElements").value(3));

            verify(jobLogRepository).findAllByOrderByStartedAtDesc(PageRequest.of(0, 20));
        }

        @Test
        @DisplayName("Should return paginated job logs with custom page and size")
        void shouldReturnPaginatedJobLogsWithCustomPageAndSize() throws Exception {
            // Given
            RetentionJobLog job = createTestJobLog(5L, JobType.ARCHIVE, JobStatus.COMPLETED);

            Page<RetentionJobLog> page = new PageImpl<>(
                    List.of(job),
                    PageRequest.of(2, 10),
                    25
            );

            given(jobLogRepository.findAllByOrderByStartedAtDesc(PageRequest.of(2, 10)))
                    .willReturn(page);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs")
                            .param("page", "2")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(1))
                    .andExpect(jsonPath("$.totalElements").value(25));

            verify(jobLogRepository).findAllByOrderByStartedAtDesc(PageRequest.of(2, 10));
        }

        @Test
        @DisplayName("Should return empty page when no jobs exist")
        void shouldReturnEmptyPageWhenNoJobsExist() throws Exception {
            // Given
            Page<RetentionJobLog> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );

            given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class)))
                    .willReturn(emptyPage);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isEmpty())
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @DisplayName("Should return job log with all fields populated")
        void shouldReturnJobLogWithAllFieldsPopulated() throws Exception {
            // Given
            LocalDateTime startedAt = LocalDateTime.of(2024, 1, 15, 10, 0, 0);
            LocalDateTime completedAt = LocalDateTime.of(2024, 1, 15, 10, 5, 0);

            RetentionJobLog job = RetentionJobLog.builder()
                    .id(1L)
                    .jobType(JobType.ARCHIVE)
                    .status(JobStatus.COMPLETED)
                    .messagesProcessed(1000)
                    .messagesArchived(500)
                    .messagesDeleted(250)
                    .bytesFreed(1048576L) // 1 MB
                    .startedAt(startedAt)
                    .completedAt(completedAt)
                    .durationMs(300000)
                    .build();

            Page<RetentionJobLog> page = new PageImpl<>(List.of(job));
            given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class)))
                    .willReturn(page);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.content[0].jobType").value("ARCHIVE"))
                    .andExpect(jsonPath("$.content[0].status").value("COMPLETED"))
                    .andExpect(jsonPath("$.content[0].messagesProcessed").value(1000))
                    .andExpect(jsonPath("$.content[0].messagesArchived").value(500))
                    .andExpect(jsonPath("$.content[0].messagesDeleted").value(250))
                    .andExpect(jsonPath("$.content[0].bytesFreed").value(1048576))
                    .andExpect(jsonPath("$.content[0].bytesFreedFormatted").value("1.0 MB"))
                    .andExpect(jsonPath("$.content[0].startedAt").value("2024-01-15T10:00:00"))
                    .andExpect(jsonPath("$.content[0].completedAt").value("2024-01-15T10:05:00"))
                    .andExpect(jsonPath("$.content[0].durationMs").value(300000));
        }

        @Test
        @DisplayName("Should return failed job log with error message")
        void shouldReturnFailedJobLogWithErrorMessage() throws Exception {
            // Given
            RetentionJobLog failedJob = createFailedJobLog(1L, JobType.ARCHIVE, "Database connection timeout");

            Page<RetentionJobLog> page = new PageImpl<>(List.of(failedJob));
            given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class)))
                    .willReturn(page);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].status").value("FAILED"))
                    .andExpect(jsonPath("$.content[0].errorMessage").value("Database connection timeout"));
        }

        @Test
        @DisplayName("Should return mixed job statuses")
        void shouldReturnMixedJobStatuses() throws Exception {
            // Given
            RetentionJobLog completedJob = createTestJobLog(1L, JobType.ARCHIVE, JobStatus.COMPLETED);
            RetentionJobLog failedJob = createFailedJobLog(2L, JobType.PURGE_ARCHIVE, "Disk full");
            RetentionJobLog startedJob = RetentionJobLog.builder()
                    .id(3L)
                    .jobType(JobType.STATS_AGGREGATE)
                    .status(JobStatus.STARTED)
                    .messagesProcessed(50)
                    .startedAt(LocalDateTime.now())
                    .build();

            Page<RetentionJobLog> page = new PageImpl<>(List.of(startedJob, completedJob, failedJob));
            given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class)))
                    .willReturn(page);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].status").value("STARTED"))
                    .andExpect(jsonPath("$.content[1].status").value("COMPLETED"))
                    .andExpect(jsonPath("$.content[2].status").value("FAILED"));
        }

        @Test
        @DisplayName("Should format bytes correctly for various sizes")
        void shouldFormatBytesCorrectlyForVariousSizes() throws Exception {
            // Given
            RetentionJobLog jobBytes = createTestJobLog(1L, JobType.ARCHIVE, JobStatus.COMPLETED);
            jobBytes.setBytesFreed(500L);

            RetentionJobLog jobKB = createTestJobLog(2L, JobType.ARCHIVE, JobStatus.COMPLETED);
            jobKB.setBytesFreed(5120L); // 5 KB

            RetentionJobLog jobMB = createTestJobLog(3L, JobType.ARCHIVE, JobStatus.COMPLETED);
            jobMB.setBytesFreed(5242880L); // 5 MB

            RetentionJobLog jobGB = createTestJobLog(4L, JobType.ARCHIVE, JobStatus.COMPLETED);
            jobGB.setBytesFreed(5368709120L); // 5 GB

            Page<RetentionJobLog> page = new PageImpl<>(List.of(jobBytes, jobKB, jobMB, jobGB));
            given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class)))
                    .willReturn(page);

            // When & Then
            mockMvc.perform(get("/api/retention/jobs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].bytesFreedFormatted").value("500 B"))
                    .andExpect(jsonPath("$.content[1].bytesFreedFormatted").value("5.0 KB"))
                    .andExpect(jsonPath("$.content[2].bytesFreedFormatted").value("5.0 MB"))
                    .andExpect(jsonPath("$.content[3].bytesFreedFormatted").value("5.0 GB"));
        }
    }

    // =========================================================================
    // GET JOB STATS
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/jobs/stats")
    class GetJobStats {

        @Test
        @DisplayName("Should return job stats successfully")
        void shouldReturnJobStatsSuccessfully() throws Exception {
            // Given
            LocalDateTime lastArchiveAt = LocalDateTime.of(2024, 1, 15, 10, 30, 0);
            RetentionJobLog lastArchiveJob = createTestJobLog(1L, JobType.ARCHIVE, JobStatus.COMPLETED);
            lastArchiveJob.setCompletedAt(lastArchiveAt);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalJobs", 100L);
            stats.put("completedJobs", 95L);
            stats.put("failedJobs", 5L);
            stats.put("totalBytesFreed", 104857600L); // 100 MB

            given(jobLogRepository.getJobStatsSince(any(LocalDateTime.class))).willReturn(stats);
            given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                    JobType.ARCHIVE, JobStatus.COMPLETED))
                    .willReturn(Optional.of(lastArchiveJob));

            // When & Then
            mockMvc.perform(get("/api/retention/jobs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalJobs").value(100))
                    .andExpect(jsonPath("$.completedJobs").value(95))
                    .andExpect(jsonPath("$.failedJobs").value(5))
                    .andExpect(jsonPath("$.totalBytesFreed").value(104857600))
                    .andExpect(jsonPath("$.lastArchiveAt").value("2024-01-15T10:30:00"))
                    .andExpect(jsonPath("$.bytesFreedFormatted").value("100.0 MB"));

            verify(jobLogRepository).getJobStatsSince(any(LocalDateTime.class));
        }

        @Test
        @DisplayName("Should return null lastArchiveAt when no archive job completed")
        void shouldReturnNullLastArchiveAtWhenNoArchiveJobCompleted() throws Exception {
            // Given
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalJobs", 10L);
            stats.put("totalBytesFreed", 1024L);

            given(jobLogRepository.getJobStatsSince(any(LocalDateTime.class))).willReturn(stats);
            given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                    JobType.ARCHIVE, JobStatus.COMPLETED))
                    .willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/jobs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.lastArchiveAt").doesNotExist());
        }

        @Test
        @DisplayName("Should handle empty stats gracefully")
        void shouldHandleEmptyStatsGracefully() throws Exception {
            // Given
            Map<String, Object> emptyStats = new HashMap<>();

            given(jobLogRepository.getJobStatsSince(any(LocalDateTime.class))).willReturn(emptyStats);
            given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                    JobType.ARCHIVE, JobStatus.COMPLETED))
                    .willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/jobs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bytesFreedFormatted").value("0 B"));
        }

        @Test
        @DisplayName("Should handle null totalBytesFreed")
        void shouldHandleNullTotalBytesFreed() throws Exception {
            // Given
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalJobs", 5L);
            stats.put("totalBytesFreed", null);

            given(jobLogRepository.getJobStatsSince(any(LocalDateTime.class))).willReturn(stats);
            given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                    JobType.ARCHIVE, JobStatus.COMPLETED))
                    .willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/jobs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bytesFreedFormatted").value("0 B"));
        }

        @Test
        @DisplayName("Should format large bytes correctly")
        void shouldFormatLargeBytesCorrectly() throws Exception {
            // Given
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBytesFreed", 10737418240L); // 10 GB

            given(jobLogRepository.getJobStatsSince(any(LocalDateTime.class))).willReturn(stats);
            given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                    JobType.ARCHIVE, JobStatus.COMPLETED))
                    .willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/jobs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bytesFreedFormatted").value("10.0 GB"));
        }

        @Test
        @DisplayName("Should return stats from last 7 days")
        void shouldReturnStatsFromLast7Days() throws Exception {
            // Given
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalJobs", 50L);
            stats.put("totalBytesFreed", 0L);

            given(jobLogRepository.getJobStatsSince(any(LocalDateTime.class))).willReturn(stats);
            given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(
                    JobType.ARCHIVE, JobStatus.COMPLETED))
                    .willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/jobs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalJobs").value(50));

            verify(jobLogRepository).getJobStatsSince(any(LocalDateTime.class));
        }
    }
}