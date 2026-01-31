package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import com.kafkaflow.visualizer.service.kafkatopic.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(KafkaTopicController.class)
public class KafkaTopicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private KafkaTopicService topicService;

    @MockBean
    private KafkaTopicMessageService messageService;

    @MockBean
    private KafkaTopicStatsService statsService;

    @MockBean
    private KafkaOrphanTopicService orphanService;

    @MockBean
    private KafkaConnectionService connectionService;

    @Test
    public void getTopicsByConnection_ShouldReturnList() throws Exception {
        // Given
        TopicResponse topic1 = TopicResponse.builder().id(1L).name("topic1").build();
        List<TopicResponse> topics = Collections.singletonList(topic1);

        given(topicService.getTopicsByConnection(1L)).willReturn(topics);

        // When & Then
        mockMvc.perform(get("/api/topics/connection/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("topic1"));
    }

    @Test
    public void getTopic_ShouldReturnTopic() throws Exception {
        // Given
        TopicResponse topic = TopicResponse.builder().id(1L).name("topic1").build();

        given(topicService.getTopic(1L)).willReturn(topic);

        // When & Then
        mockMvc.perform(get("/api/topics/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("topic1"));
    }

    @Test
    public void updateTopic_ShouldReturnUpdatedTopic() throws Exception {
        // Given
        TopicUpdateRequest request = TopicUpdateRequest.builder()
                .description("Updated")
                .build();

        TopicResponse response = TopicResponse.builder()
                .id(1L)
                .name("topic1")
                .description("Updated")
                .build();

        given(topicService.updateTopic(eq(1L), any(TopicUpdateRequest.class))).willReturn(response);

        // When & Then
        mockMvc.perform(put("/api/topics/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.description").value("Updated"));
    }

    @Test
    public void deleteTopic_ShouldReturnSuccess() throws Exception {
        // Given
        doNothing().when(topicService).deleteTopic(1L);

        // When & Then
        mockMvc.perform(delete("/api/topics/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void syncTopics_ShouldReturnSyncedTopics() throws Exception {
        // Given
        List<String> discoveredTopics = Arrays.asList("topic1", "topic2");
        List<TopicResponse> syncedTopics = Arrays.asList(
                TopicResponse.builder().name("topic1").build(),
                TopicResponse.builder().name("topic2").build()
        );

        given(connectionService.discoverTopics(1L)).willReturn(discoveredTopics);
        given(topicService.syncTopics(1L, discoveredTopics)).willReturn(syncedTopics);

        // When & Then
        mockMvc.perform(post("/api/topics/connection/1/sync"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    public void getMessages_ShouldReturnPage() throws Exception {
        // Given
        MessageResponse msg = MessageResponse.builder().id(1L).value("test").build();
        Page<MessageResponse> page = new PageImpl<>(Collections.singletonList(msg));

        given(messageService.getMessages(any(MessageFilter.class))).willReturn(page);

        // When & Then
        mockMvc.perform(get("/api/topics/1/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].value").value("test"));
    }

    @Test
    public void getLiveStats_ShouldReturnStats() throws Exception {
        // Given
        TopicLiveStatsResponse stats = TopicLiveStatsResponse.builder()
                .topicId(1L)
                .topicName("topic1")
                .totalMessages(100L)
                .build();

        given(statsService.getLiveStats(1L)).willReturn(stats);

        // When & Then
        mockMvc.perform(get("/api/topics/1/live-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalMessages").value(100));
    }

    @Test
    public void getOrphanTopics_ShouldReturnList() throws Exception {
        // Given
        TopicResponse orphan = TopicResponse.builder().id(1L).name("orphan-topic").build();

        given(orphanService.getOrphanTopics()).willReturn(Collections.singletonList(orphan));

        // When & Then
        mockMvc.perform(get("/api/topics/orphans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("orphan-topic"));
    }
}