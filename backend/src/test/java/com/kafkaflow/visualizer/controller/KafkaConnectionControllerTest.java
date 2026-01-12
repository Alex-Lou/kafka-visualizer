package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class KafkaConnectionControllerTest {

    @Mock
    private KafkaConnectionService connectionService;

    @InjectMocks
    private KafkaConnectionController kafkaConnectionController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(kafkaConnectionController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetAllConnections() throws Exception {
        // Given
        KafkaDto.ConnectionResponse connectionResponse = new KafkaDto.ConnectionResponse();
        List<KafkaDto.ConnectionResponse> connections = Collections.singletonList(connectionResponse);
        when(connectionService.getAllConnections()).thenReturn(connections);

        // When & Then
        mockMvc.perform(get("/api/connections"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetConnection() throws Exception {
        // Given
        KafkaDto.ConnectionResponse connectionResponse = new KafkaDto.ConnectionResponse();
        when(connectionService.getConnection(anyLong())).thenReturn(connectionResponse);

        // When & Then
        mockMvc.perform(get("/api/connections/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateConnection() throws Exception {
        // Given
        KafkaDto.ConnectionRequest connectionRequest = new KafkaDto.ConnectionRequest();
        KafkaDto.ConnectionResponse connectionResponse = new KafkaDto.ConnectionResponse();
        when(connectionService.createConnection(any(KafkaDto.ConnectionRequest.class))).thenReturn(connectionResponse);

        // When & Then
        mockMvc.perform(post("/api/connections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(connectionRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateConnection() throws Exception {
        // Given
        KafkaDto.ConnectionRequest connectionRequest = new KafkaDto.ConnectionRequest();
        KafkaDto.ConnectionResponse connectionResponse = new KafkaDto.ConnectionResponse();
        when(connectionService.updateConnection(anyLong(), any(KafkaDto.ConnectionRequest.class))).thenReturn(connectionResponse);

        // When & Then
        mockMvc.perform(put("/api/connections/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(connectionRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteConnection() throws Exception {
        // Given
        doNothing().when(connectionService).deleteConnection(anyLong());

        // When & Then
        mockMvc.perform(delete("/api/connections/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testTestConnection() throws Exception {
        // Given
        KafkaDto.ConnectionResponse connectionResponse = new KafkaDto.ConnectionResponse();
        when(connectionService.testConnection(anyLong())).thenReturn(connectionResponse);

        // When & Then
        mockMvc.perform(post("/api/connections/1/test"))
                .andExpect(status().isOk());
    }

    @Test
    void testDiscoverTopics() throws Exception {
        // Given
        List<String> topics = Collections.singletonList("topic1");
        when(connectionService.discoverTopics(anyLong())).thenReturn(topics);

        // When & Then
        mockMvc.perform(get("/api/connections/1/topics/discover"))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateErrorTestConnection() throws Exception {
        // Given
        KafkaDto.ConnectionResponse connectionResponse = new KafkaDto.ConnectionResponse();
        when(connectionService.createErrorTestConnection()).thenReturn(connectionResponse);

        // When & Then
        mockMvc.perform(post("/api/connections/test-error"))
                .andExpect(status().isOk());
    }
}
