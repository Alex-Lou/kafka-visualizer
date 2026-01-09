package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.model.RetentionPolicy;
import com.kafkaflow.visualizer.repository.*;
import com.kafkaflow.visualizer.service.MessageRetentionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RetentionController.class)
public class RetentionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageRetentionService retentionService;
    @MockBean
    private RetentionPolicyRepository policyRepository;
    @MockBean
    private KafkaMessageArchiveRepository archiveRepository;
    @MockBean
    private KafkaMessageStatsRepository statsRepository;
    @MockBean
    private RetentionJobLogRepository jobLogRepository;
    @MockBean
    private KafkaTopicRepository topicRepository;
    @MockBean
    private KafkaMessageRepository messageRepository;
    @MockBean
    private KafkaConnectionRepository connectionRepository;

    @Test
    public void getAllPolicies_ShouldReturnList() throws Exception {
        // Given
        RetentionPolicy policy = RetentionPolicy.builder().id(1L).policyName("Policy 1").build();
        given(policyRepository.findByIsActiveTrueOrderByPriorityDesc()).willReturn(Collections.singletonList(policy));

        // When
        mockMvc.perform(get("/api/retention/policies"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].policyName").value("Policy 1"));
    }

    @Test
    public void createPolicy_ShouldReturnCreatedPolicy() throws Exception {
        // Given
        CreatePolicyRequest request = CreatePolicyRequest.builder()
                .policyName("New Policy")
                .build();
        
        RetentionPolicy policy = RetentionPolicy.builder()
                .id(1L)
                .policyName("New Policy")
                .build();

        given(policyRepository.save(any(RetentionPolicy.class))).willReturn(policy);

        // When
        mockMvc.perform(post("/api/retention/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("New Policy"));
    }

    @Test
    public void updatePolicy_ShouldReturnUpdatedPolicy() throws Exception {
        // Given
        UpdatePolicyRequest request = UpdatePolicyRequest.builder()
                .policyName("Updated Policy")
                .build();

        RetentionPolicy policy = RetentionPolicy.builder()
                .id(1L)
                .policyName("Updated Policy")
                .build();

        given(policyRepository.findById(1L)).willReturn(Optional.of(policy));
        given(policyRepository.save(any(RetentionPolicy.class))).willReturn(policy);

        // When
        mockMvc.perform(put("/api/retention/policies/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("Updated Policy"));
    }

    @Test
    public void deletePolicy_ShouldReturnSuccess() throws Exception {
        // Given
        doNothing().when(policyRepository).deleteById(1L);

        // When
        mockMvc.perform(delete("/api/retention/policies/1"))
                // Then
                .andExpect(status().isOk());
    }

    @Test
    public void getGlobalStorage_ShouldReturnStorage() throws Exception {
        // Given
        given(topicRepository.findAll()).willReturn(Collections.emptyList());
        given(jobLogRepository.findTopByJobTypeAndStatusOrderByStartedAtDesc(any(), any())).willReturn(Optional.empty());

        // When
        mockMvc.perform(get("/api/retention/storage"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMessages").value(0));
    }

    @Test
    public void triggerArchive_ShouldReturnJobLog() throws Exception {
        // Given
        RetentionJobLog job = RetentionJobLog.builder()
                .id(1L)
                .jobType(RetentionJobLog.JobType.ARCHIVE)
                .status(RetentionJobLog.JobStatus.COMPLETED)
                .build();

        given(retentionService.archiveOldMessages()).willReturn(job);

        // When
        mockMvc.perform(post("/api/retention/actions/archive"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobType").value("ARCHIVE"));
    }

    @Test
    public void getJobLogs_ShouldReturnPage() throws Exception {
        // Given
        RetentionJobLog job = RetentionJobLog.builder()
                .id(1L)
                .jobType(RetentionJobLog.JobType.ARCHIVE)
                .status(RetentionJobLog.JobStatus.COMPLETED)
                .build();
        Page<RetentionJobLog> page = new PageImpl<>(Collections.singletonList(job));

        given(jobLogRepository.findAllByOrderByStartedAtDesc(any(Pageable.class))).willReturn(page);

        // When
        mockMvc.perform(get("/api/retention/jobs"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].jobType").value("ARCHIVE"));
    }
}
