package com.kafkaflow.visualizer.controller.retention;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.RetentionDto.ResetTopicRequest;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobStatus;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.service.retention.RetentionArchiveService;
import com.kafkaflow.visualizer.service.retention.RetentionManualService;
import com.kafkaflow.visualizer.service.retention.RetentionStatsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RetentionActionController.class)
@DisplayName("RetentionActionController Tests")
class RetentionActionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RetentionArchiveService archiveService;

    @MockBean
    private RetentionStatsService statsService;

    @MockBean
    private RetentionManualService manualService;

    // =========================================================================
    // TEST DATA BUILDERS
    // =========================================================================

    private RetentionJobLog createTestJobLog(JobType type, JobStatus status) {
        return RetentionJobLog.builder()
                .id(1L)
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

    private RetentionJobLog createFailedJobLog(JobType type, String errorMessage) {
        return RetentionJobLog.builder()
                .id(1L)
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
    // TRIGGER ARCHIVE
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/archive")
    class TriggerArchive {

        @Test
        @DisplayName("Should trigger archive job successfully")
        void shouldTriggerArchiveJobSuccessfully() throws Exception {
            // Given
            RetentionJobLog jobLog = createTestJobLog(JobType.ARCHIVE, JobStatus.COMPLETED);
            given(archiveService.archiveOldMessages()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.jobType").value("ARCHIVE"))
                    .andExpect(jsonPath("$.status").value("COMPLETED"))
                    .andExpect(jsonPath("$.messagesProcessed").value(100))
                    .andExpect(jsonPath("$.messagesArchived").value(50))
                    .andExpect(jsonPath("$.bytesFreed").value(10240))
                    .andExpect(jsonPath("$.bytesFreedFormatted").value("10.0 KB"));

            verify(archiveService).archiveOldMessages();
        }

        @Test
        @DisplayName("Should return failed job log when archive fails")
        void shouldReturnFailedJobLogWhenArchiveFails() throws Exception {
            // Given
            RetentionJobLog jobLog = createFailedJobLog(JobType.ARCHIVE, "Database connection lost");
            given(archiveService.archiveOldMessages()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.errorMessage").value("Database connection lost"));
        }

        @Test
        @DisplayName("Should return zero stats when nothing to archive")
        void shouldReturnZeroStatsWhenNothingToArchive() throws Exception {
            // Given
            RetentionJobLog jobLog = RetentionJobLog.builder()
                    .id(1L)
                    .jobType(JobType.ARCHIVE)
                    .status(JobStatus.COMPLETED)
                    .messagesProcessed(0)
                    .messagesArchived(0)
                    .messagesDeleted(0)
                    .bytesFreed(0L)
                    .startedAt(LocalDateTime.now())
                    .completedAt(LocalDateTime.now())
                    .durationMs(1000)
                    .build();
            given(archiveService.archiveOldMessages()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesArchived").value(0))
                    .andExpect(jsonPath("$.bytesFreed").value(0));
        }
    }

    // =========================================================================
    // TRIGGER PURGE
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/purge")
    class TriggerPurge {

        @Test
        @DisplayName("Should trigger purge job successfully")
        void shouldTriggerPurgeJobSuccessfully() throws Exception {
            // Given
            RetentionJobLog jobLog = createTestJobLog(JobType.PURGE_ARCHIVE, JobStatus.COMPLETED);
            jobLog.setMessagesDeleted(100);
            given(archiveService.purgeExpiredArchives()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/purge"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.jobType").value("PURGE_ARCHIVE"))
                    .andExpect(jsonPath("$.status").value("COMPLETED"))
                    .andExpect(jsonPath("$.messagesDeleted").value(100));

            verify(archiveService).purgeExpiredArchives();
        }

        @Test
        @DisplayName("Should return failed job log when purge fails")
        void shouldReturnFailedJobLogWhenPurgeFails() throws Exception {
            // Given
            RetentionJobLog jobLog = createFailedJobLog(JobType.PURGE_ARCHIVE, "Disk full");
            given(archiveService.purgeExpiredArchives()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/purge"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.errorMessage").value("Disk full"));
        }
    }

    // =========================================================================
    // TRIGGER STATS AGGREGATION
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/aggregate-stats")
    class TriggerStatsAggregation {

        @Test
        @DisplayName("Should trigger stats aggregation successfully")
        void shouldTriggerStatsAggregationSuccessfully() throws Exception {
            // Given
            RetentionJobLog jobLog = createTestJobLog(JobType.STATS_AGGREGATE, JobStatus.COMPLETED);
            given(statsService.aggregateStats()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/aggregate-stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.jobType").value("STATS_AGGREGATE"))
                    .andExpect(jsonPath("$.status").value("COMPLETED"));

            verify(statsService).aggregateStats();
        }

        @Test
        @DisplayName("Should return failed job log when aggregation fails")
        void shouldReturnFailedJobLogWhenAggregationFails() throws Exception {
            // Given
            RetentionJobLog jobLog = createFailedJobLog(JobType.STATS_AGGREGATE, "Timeout");
            given(statsService.aggregateStats()).willReturn(jobLog);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/aggregate-stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.errorMessage").value("Timeout"));
        }
    }

    // =========================================================================
    // RESET TOPIC
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/reset-topic/{topicId}")
    class ResetTopic {

        @Test
        @DisplayName("Should reset topic without deleting archives")
        void shouldResetTopicWithoutDeletingArchives() throws Exception {
            // Given
            ResetTopicRequest request = new ResetTopicRequest(false);
            given(manualService.resetTopic(1L, false)).willReturn(150);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/reset-topic/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topicId").value(1))
                    .andExpect(jsonPath("$.messagesDeleted").value(150))
                    .andExpect(jsonPath("$.archivesDeleted").value(false));

            verify(manualService).resetTopic(1L, false);
        }

        @Test
        @DisplayName("Should reset topic with archives deletion")
        void shouldResetTopicWithArchivesDeletion() throws Exception {
            // Given
            ResetTopicRequest request = new ResetTopicRequest(true);
            given(manualService.resetTopic(1L, true)).willReturn(300);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/reset-topic/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topicId").value(1))
                    .andExpect(jsonPath("$.messagesDeleted").value(300))
                    .andExpect(jsonPath("$.archivesDeleted").value(true));

            verify(manualService).resetTopic(1L, true);
        }

        @Test
        @DisplayName("Should reset topic with null request body")
        void shouldResetTopicWithNullRequestBody() throws Exception {
            // Given
            given(manualService.resetTopic(1L, false)).willReturn(50);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/reset-topic/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topicId").value(1))
                    .andExpect(jsonPath("$.messagesDeleted").value(50))
                    .andExpect(jsonPath("$.archivesDeleted").value(false));

            verify(manualService).resetTopic(1L, false);
        }

        @Test
        @DisplayName("Should return zero when topic is empty")
        void shouldReturnZeroWhenTopicIsEmpty() throws Exception {
            // Given
            given(manualService.resetTopic(1L, false)).willReturn(0);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/reset-topic/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesDeleted").value(0));
        }
    }

    // =========================================================================
    // ARCHIVE TOPIC
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/archive-topic/{topicId}")
    class ArchiveTopic {

        @Test
        @DisplayName("Should archive topic messages successfully")
        void shouldArchiveTopicMessagesSuccessfully() throws Exception {
            // Given
            given(manualService.archiveTopicMessages(1L)).willReturn(250);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive-topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topicId").value(1))
                    .andExpect(jsonPath("$.messagesArchived").value(250));

            verify(manualService).archiveTopicMessages(1L);
        }

        @Test
        @DisplayName("Should return zero when no messages to archive")
        void shouldReturnZeroWhenNoMessagesToArchive() throws Exception {
            // Given
            given(manualService.archiveTopicMessages(1L)).willReturn(0);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive-topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesArchived").value(0));
        }
    }

    // =========================================================================
    // ARCHIVE SPECIFIC MESSAGES
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/archive-messages")
    class ArchiveMessages {

        @Test
        @DisplayName("Should archive specific messages successfully")
        void shouldArchiveSpecificMessagesSuccessfully() throws Exception {
            // Given
            List<Long> messageIds = List.of(1L, 2L, 3L, 4L, 5L);
            given(manualService.archiveSpecificMessages(messageIds)).willReturn(5);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive-messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(messageIds)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesArchived").value(5));

            verify(manualService).archiveSpecificMessages(messageIds);
        }

        @Test
        @DisplayName("Should return zero when message IDs not found")
        void shouldReturnZeroWhenMessageIdsNotFound() throws Exception {
            // Given
            List<Long> messageIds = List.of(999L, 998L);
            given(manualService.archiveSpecificMessages(messageIds)).willReturn(0);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive-messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(messageIds)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesArchived").value(0));
        }

        @Test
        @DisplayName("Should handle empty message ID list")
        void shouldHandleEmptyMessageIdList() throws Exception {
            // Given
            List<Long> messageIds = List.of();
            given(manualService.archiveSpecificMessages(messageIds)).willReturn(0);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive-messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(messageIds)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesArchived").value(0));
        }

        @Test
        @DisplayName("Should archive partial list when some messages not found")
        void shouldArchivePartialListWhenSomeMessagesNotFound() throws Exception {
            // Given
            List<Long> messageIds = List.of(1L, 2L, 999L);
            given(manualService.archiveSpecificMessages(messageIds)).willReturn(2);

            // When & Then
            mockMvc.perform(post("/api/retention/actions/archive-messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(messageIds)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.messagesArchived").value(2));
        }
    }

    // =========================================================================
    // BOOKMARK MESSAGE
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/actions/bookmark/{messageId}")
    class BookmarkMessage {

        @Test
        @DisplayName("Should bookmark message successfully")
        void shouldBookmarkMessageSuccessfully() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/retention/actions/bookmark/1")
                            .param("bookmarked", "true"))
                    .andExpect(status().isOk());

            verify(manualService).bookmarkMessage(1L, true);
        }

        @Test
        @DisplayName("Should unbookmark message successfully")
        void shouldUnbookmarkMessageSuccessfully() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/retention/actions/bookmark/1")
                            .param("bookmarked", "false"))
                    .andExpect(status().isOk());

            verify(manualService).bookmarkMessage(1L, false);
        }
    }
}