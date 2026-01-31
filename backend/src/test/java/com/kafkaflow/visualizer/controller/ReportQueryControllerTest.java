package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.dto.ReportQueryRequest;
import com.kafkaflow.visualizer.service.kafkatopic.KafkaTopicMessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportQueryController.class)
public class ReportQueryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private KafkaTopicMessageService messageService;

    @Test
    public void getMessagesForReport_ShouldReturnMessages() throws Exception {
        // Given
        ReportQueryRequest request = ReportQueryRequest.builder()
                .topicIds(List.of(1L))
                .build();

        MessageResponse msg = MessageResponse.builder().id(1L).value("test").build();
        List<MessageResponse> messages = List.of(msg);

        given(messageService.getMessagesForReport(anyList())).willReturn(messages);

        // When & Then
        mockMvc.perform(post("/api/report-query/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].value").value("test"));
    }

    @Test
    public void getMessagesForReport_ShouldReturn400_WhenNoTopicIds() throws Exception {
        // Given
        ReportQueryRequest request = ReportQueryRequest.builder()
                .topicIds(Collections.emptyList())
                .build();

        // When & Then
        mockMvc.perform(post("/api/report-query/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}