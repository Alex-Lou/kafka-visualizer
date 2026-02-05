package com.kafkaflow.visualizer.controller.retention;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kafkaflow.visualizer.dto.RetentionDto.GlobalStorageResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.PurgeRequest;
import com.kafkaflow.visualizer.dto.RetentionDto.StorageUsageResponse;
import com.kafkaflow.visualizer.service.retention.RetentionManualService;
import com.kafkaflow.visualizer.service.retention.RetentionStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RetentionStorageControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RetentionStorageService storageService;

    @Mock
    private RetentionManualService manualService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(new RetentionStorageController(storageService, manualService))
                .build();
    }

    @Test
    void shouldDelegateGetGlobalStorage_ToStorageService() throws Exception {
        when(storageService.getGlobalStorage())
                .thenReturn(GlobalStorageResponse.builder().totalMessages(100L).build());

        mockMvc.perform(get("/api/retention/storage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true)) // Vérifie le wrapper ApiResponse
                .andExpect(jsonPath("$.data.totalMessages").value(100)); // Vérifie les données
    }

    @Test
    void shouldDelegateGetTopicStorage_ToStorageService() throws Exception {
        Long topicId = 123L;
        when(storageService.getTopicStorage(topicId))
                .thenReturn(StorageUsageResponse.builder().topicId(topicId).build());

        mockMvc.perform(get("/api/retention/storage/topic/{id}", topicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.topicId").value(123));
    }

    @Test
    void shouldDelegateManualArchive_ToManualService() throws Exception {
        Long topicId = 1L;
        when(manualService.archiveTopicMessages(topicId)).thenReturn(50);

        mockMvc.perform(post("/api/retention/storage/topic/{id}/archive", topicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(50))
                .andExpect(jsonPath("$.message").exists()); // Vérifie qu'on a un message de succès
    }

    @Test
    void shouldDelegatePurge_ToManualService() throws Exception {
        PurgeRequest request = new PurgeRequest();
        request.setOlderThan(LocalDateTime.now().minusDays(1));
        request.setArchiveFirst(true);

        when(manualService.purgeMessagesOlderThan(any(), anyBoolean())).thenReturn(10);

        mockMvc.perform(post("/api/retention/storage/purge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(10));
    }
}