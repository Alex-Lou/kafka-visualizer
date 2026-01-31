package com.kafkaflow.visualizer.controller.retention;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.model.RetentionPolicy;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.repository.RetentionPolicyRepository;
import com.kafkaflow.visualizer.service.retention.RetentionPolicyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RetentionPolicyController.class)
@DisplayName("RetentionPolicyController Tests")
class RetentionPolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RetentionPolicyService policyService;

    @MockBean
    private RetentionPolicyRepository policyRepository;

    @MockBean
    private KafkaTopicRepository topicRepository;

    @MockBean
    private KafkaConnectionRepository connectionRepository;

    // =========================================================================
    // TEST DATA BUILDERS
    // =========================================================================

    private RetentionPolicy createTestPolicy(Long id, String name) {
        return RetentionPolicy.builder()
                .id(id)
                .policyName(name)
                .hotRetentionHours(168)
                .hotMaxMessages(100000)
                .hotMaxSizeMb(1000)
                .archiveEnabled(true)
                .archiveRetentionDays(90)
                .archiveCompress(true)
                .statsEnabled(true)
                .statsRetentionDays(365)
                .autoPurgeEnabled(true)
                .purgeBookmarked(false)
                .priority(0)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private KafkaTopic createTestTopic(Long id, String name) {
        KafkaConnection connection = KafkaConnection.builder()
                .id(1L)
                .name("Test Connection")
                .build();

        return KafkaTopic.builder()
                .id(id)
                .name(name)
                .connection(connection)
                .build();
    }

    // =========================================================================
    // GET ALL POLICIES
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/policies")
    class GetAllPolicies {

        @Test
        @DisplayName("Should return list of active policies")
        void shouldReturnListOfActivePolicies() throws Exception {
            // Given
            RetentionPolicy policy1 = createTestPolicy(1L, "Policy 1");
            RetentionPolicy policy2 = createTestPolicy(2L, "Policy 2");
            given(policyRepository.findByIsActiveTrueOrderByPriorityDesc())
                    .willReturn(List.of(policy1, policy2));

            // When & Then
            mockMvc.perform(get("/api/retention/policies"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].policyName").value("Policy 1"))
                    .andExpect(jsonPath("$[1].policyName").value("Policy 2"));

            verify(policyRepository).findByIsActiveTrueOrderByPriorityDesc();
        }

        @Test
        @DisplayName("Should return empty list when no policies exist")
        void shouldReturnEmptyListWhenNoPoliciesExist() throws Exception {
            // Given
            given(policyRepository.findByIsActiveTrueOrderByPriorityDesc())
                    .willReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/retention/policies"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should include topic and connection names when present")
        void shouldIncludeTopicAndConnectionNamesWhenPresent() throws Exception {
            // Given
            RetentionPolicy policy = createTestPolicy(1L, "Topic Policy");
            policy.setTopicId(10L);
            policy.setConnectionId(20L);

            given(policyRepository.findByIsActiveTrueOrderByPriorityDesc())
                    .willReturn(List.of(policy));
            given(topicRepository.findById(10L))
                    .willReturn(Optional.of(createTestTopic(10L, "my-topic")));
            given(connectionRepository.findById(20L))
                    .willReturn(Optional.of(KafkaConnection.builder().id(20L).name("my-connection").build()));

            // When & Then
            mockMvc.perform(get("/api/retention/policies"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].topicName").value("my-topic"))
                    .andExpect(jsonPath("$[0].connectionName").value("my-connection"));
        }
    }

    // =========================================================================
    // GET GLOBAL POLICY
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/policies/global")
    class GetGlobalPolicy {

        @Test
        @DisplayName("Should return existing global policy")
        void shouldReturnExistingGlobalPolicy() throws Exception {
            // Given
            RetentionPolicy globalPolicy = createTestPolicy(1L, "Global Policy");
            given(policyRepository.findGlobalPolicy()).willReturn(Optional.of(globalPolicy));

            // When & Then
            mockMvc.perform(get("/api/retention/policies/global"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("Global Policy"))
                    .andExpect(jsonPath("$.hotRetentionHours").value(168));

            verify(policyRepository).findGlobalPolicy();
        }

        @Test
        @DisplayName("Should create and return default policy when none exists")
        void shouldCreateDefaultPolicyWhenNoneExists() throws Exception {
            // Given
            RetentionPolicy defaultPolicy = createTestPolicy(1L, "Global Default Policy");

            given(policyRepository.findGlobalPolicy()).willReturn(Optional.empty());
            given(policyService.createDefaultPolicy()).willReturn(defaultPolicy);
            given(policyRepository.save(any(RetentionPolicy.class))).willReturn(defaultPolicy);

            // When & Then
            mockMvc.perform(get("/api/retention/policies/global"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("Global Default Policy"));

            verify(policyService).createDefaultPolicy();
            verify(policyRepository).save(any(RetentionPolicy.class));
        }
    }

    // =========================================================================
    // GET TOPIC POLICY
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/policies/topic/{topicId}")
    class GetTopicPolicy {

        @Test
        @DisplayName("Should return effective policy for topic")
        void shouldReturnEffectivePolicyForTopic() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            RetentionPolicy policy = createTestPolicy(1L, "Topic Policy");

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(policyRepository.findEffectivePolicy(1L, 1L)).willReturn(Optional.of(policy));

            // When & Then
            mockMvc.perform(get("/api/retention/policies/topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("Topic Policy"));
        }

        @Test
        @DisplayName("Should return default policy when no specific policy exists")
        void shouldReturnDefaultPolicyWhenNoSpecificPolicyExists() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            RetentionPolicy defaultPolicy = createTestPolicy(1L, "Global Default Policy");

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(policyRepository.findEffectivePolicy(1L, 1L)).willReturn(Optional.empty());
            given(policyService.createDefaultPolicy()).willReturn(defaultPolicy);
            given(policyRepository.save(any(RetentionPolicy.class))).willReturn(defaultPolicy);

            // When & Then
            mockMvc.perform(get("/api/retention/policies/topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("Global Default Policy"));
        }

        @Test
        @DisplayName("Should return 404 when topic not found")
        void shouldReturn404WhenTopicNotFound() throws Exception {
            // Given
            given(topicRepository.findById(999L)).willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/policies/topic/999"))
                    .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // CREATE POLICY
    // =========================================================================

    @Nested
    @DisplayName("POST /api/retention/policies")
    class CreatePolicy {

        @Test
        @DisplayName("Should create policy with all fields")
        void shouldCreatePolicyWithAllFields() throws Exception {
            // Given
            CreatePolicyRequest request = CreatePolicyRequest.builder()
                    .policyName("New Policy")
                    .topicId(1L)
                    .connectionId(2L)
                    .hotRetentionHours(72)
                    .hotMaxMessages(50000)
                    .hotMaxSizeMb(500)
                    .archiveEnabled(true)
                    .archiveRetentionDays(30)
                    .archiveCompress(false)
                    .statsEnabled(true)
                    .statsRetentionDays(180)
                    .autoPurgeEnabled(true)
                    .purgeBookmarked(true)
                    .priority(10)
                    .build();

            RetentionPolicy savedPolicy = createTestPolicy(1L, "New Policy");
            savedPolicy.setTopicId(1L);
            savedPolicy.setConnectionId(2L);

            given(policyRepository.save(any(RetentionPolicy.class))).willReturn(savedPolicy);

            // When & Then
            mockMvc.perform(post("/api/retention/policies")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("New Policy"));

            verify(policyRepository).save(any(RetentionPolicy.class));
        }

        @Test
        @DisplayName("Should create policy with default values when not specified")
        void shouldCreatePolicyWithDefaultValues() throws Exception {
            // Given
            CreatePolicyRequest request = CreatePolicyRequest.builder()
                    .policyName("Minimal Policy")
                    .build();

            RetentionPolicy savedPolicy = createTestPolicy(1L, "Minimal Policy");
            given(policyRepository.save(any(RetentionPolicy.class))).willReturn(savedPolicy);

            // When & Then
            mockMvc.perform(post("/api/retention/policies")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.hotRetentionHours").value(168))
                    .andExpect(jsonPath("$.hotMaxMessages").value(100000));
        }
    }

    // =========================================================================
    // UPDATE POLICY
    // =========================================================================

    @Nested
    @DisplayName("PUT /api/retention/policies/{id}")
    class UpdatePolicy {

        @Test
        @DisplayName("Should update policy partially")
        void shouldUpdatePolicyPartially() throws Exception {
            // Given
            UpdatePolicyRequest request = UpdatePolicyRequest.builder()
                    .policyName("Updated Policy")
                    .hotRetentionHours(48)
                    .build();

            RetentionPolicy existingPolicy = createTestPolicy(1L, "Old Policy");
            RetentionPolicy updatedPolicy = createTestPolicy(1L, "Updated Policy");
            updatedPolicy.setHotRetentionHours(48);

            given(policyRepository.findById(1L)).willReturn(Optional.of(existingPolicy));
            given(policyRepository.save(any(RetentionPolicy.class))).willReturn(updatedPolicy);

            // When & Then
            mockMvc.perform(put("/api/retention/policies/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("Updated Policy"))
                    .andExpect(jsonPath("$.hotRetentionHours").value(48));
        }

        @Test
        @DisplayName("Should update all policy fields")
        void shouldUpdateAllPolicyFields() throws Exception {
            // Given
            UpdatePolicyRequest request = UpdatePolicyRequest.builder()
                    .policyName("Fully Updated")
                    .hotRetentionHours(24)
                    .hotMaxMessages(10000)
                    .hotMaxSizeMb(100)
                    .archiveEnabled(false)
                    .archiveRetentionDays(7)
                    .archiveCompress(false)
                    .statsEnabled(false)
                    .statsRetentionDays(30)
                    .autoPurgeEnabled(false)
                    .purgeBookmarked(true)
                    .priority(5)
                    .isActive(false)
                    .build();

            RetentionPolicy existingPolicy = createTestPolicy(1L, "Old Policy");
            RetentionPolicy updatedPolicy = createTestPolicy(1L, "Fully Updated");

            given(policyRepository.findById(1L)).willReturn(Optional.of(existingPolicy));
            given(policyRepository.save(any(RetentionPolicy.class))).willReturn(updatedPolicy);

            // When & Then
            mockMvc.perform(put("/api/retention/policies/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyName").value("Fully Updated"));

            verify(policyRepository).save(any(RetentionPolicy.class));
        }

        @Test
        @DisplayName("Should return 404 when policy not found")
        void shouldReturn404WhenPolicyNotFound() throws Exception {
            // Given
            UpdatePolicyRequest request = UpdatePolicyRequest.builder()
                    .policyName("Updated Policy")
                    .build();

            given(policyRepository.findById(999L)).willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(put("/api/retention/policies/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // DELETE POLICY
    // =========================================================================

    @Nested
    @DisplayName("DELETE /api/retention/policies/{id}")
    class DeletePolicy {

        @Test
        @DisplayName("Should delete policy successfully")
        void shouldDeletePolicySuccessfully() throws Exception {
            // Given
            given(policyRepository.existsById(1L)).willReturn(true);
            doNothing().when(policyRepository).deleteById(1L);

            // When & Then
            mockMvc.perform(delete("/api/retention/policies/1"))
                    .andExpect(status().isOk());

            verify(policyRepository).existsById(1L);
            verify(policyRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Should return 404 when policy not found")
        void shouldReturn404WhenPolicyNotFound() throws Exception {
            // Given
            given(policyRepository.existsById(999L)).willReturn(false);

            // When & Then
            mockMvc.perform(delete("/api/retention/policies/999"))
                    .andExpect(status().isNotFound());

            verify(policyRepository, never()).deleteById(anyLong());
        }
    }
}