package com.kafkaflow.visualizer.controller.retention;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kafkaflow.visualizer.dto.RetentionDto.JobLogResponse;
import com.kafkaflow.visualizer.mapper.RetentionDtoMapper;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.RetentionJobLogRepository;
import com.kafkaflow.visualizer.service.retention.RetentionArchiveService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RetentionJobControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RetentionJobLogRepository jobLogRepository;

    @Mock
    private RetentionArchiveService archiveService;

    @Mock
    private RetentionDtoMapper mapper;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @BeforeEach
    void setup() {
        // Setup Standalone pour tester uniquement ce contrôleur
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(new RetentionJobController(jobLogRepository, archiveService, mapper))
                .build();
    }

    @Test
    void shouldGetRecentJobs() throws Exception {
        // GIVEN
        RetentionJobLog log = new RetentionJobLog();
        log.setId(1L);
        log.setJobType(JobType.ARCHIVE);

        // Le contrôleur appelle findAll avec pagination
        when(jobLogRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        JobLogResponse responseDto = JobLogResponse.builder().id(1L).jobType("ARCHIVE").build();
        when(mapper.toJobLogResponse(log)).thenReturn(responseDto);

        // WHEN
        mockMvc.perform(get("/api/retention/jobs")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true)) // Vérification ApiResponse
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].jobType").value("ARCHIVE"));

        // THEN
        verify(jobLogRepository).findAll(any(Pageable.class));
    }

    @Test
    void shouldGetJobsByType() throws Exception {
        // GIVEN
        RetentionJobLog log = new RetentionJobLog();
        log.setJobType(JobType.PURGE_HOT);

        when(jobLogRepository.findByJobType(eq(JobType.PURGE_HOT), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        JobLogResponse responseDto = JobLogResponse.builder().jobType("PURGE_HOT").build();
        when(mapper.toJobLogResponse(log)).thenReturn(responseDto);

        // WHEN
        mockMvc.perform(get("/api/retention/jobs/type/PURGE_HOT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].jobType").value("PURGE_HOT"));
    }

    @Test
    void shouldRunArchiveJob() throws Exception {
        // GIVEN
        RetentionJobLog log = new RetentionJobLog();
        log.setJobType(JobType.ARCHIVE);
        log.setStatus(RetentionJobLog.JobStatus.COMPLETED);

        when(archiveService.archiveOldMessages()).thenReturn(log);

        JobLogResponse responseDto = JobLogResponse.builder().status("COMPLETED").build();
        when(mapper.toJobLogResponse(log)).thenReturn(responseDto);

        // WHEN
        mockMvc.perform(post("/api/retention/jobs/run/archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // THEN
        verify(archiveService).archiveOldMessages();
    }

    @Test
    void shouldRunPurgeArchiveJob() throws Exception {
        // GIVEN
        RetentionJobLog log = new RetentionJobLog();
        when(archiveService.purgeExpiredArchives()).thenReturn(log);

        JobLogResponse responseDto = JobLogResponse.builder().jobType("PURGE_ARCHIVE").build();
        when(mapper.toJobLogResponse(log)).thenReturn(responseDto);

        // WHEN
        mockMvc.perform(post("/api/retention/jobs/run/purge-archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // THEN
        verify(archiveService).purgeExpiredArchives();
    }
}