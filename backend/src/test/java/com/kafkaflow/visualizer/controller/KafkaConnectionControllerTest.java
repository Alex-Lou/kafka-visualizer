package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.ConnectionRequest;
import com.kafkaflow.visualizer.dto.KafkaDto.ConnectionResponse;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(KafkaConnectionController.class)
public class KafkaConnectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private KafkaConnectionService connectionService;

    @Test
    public void getAllConnections_ShouldReturnList() throws Exception {
        // Given
        ConnectionResponse conn1 = ConnectionResponse.builder().id(1L).name("Local").build();
        ConnectionResponse conn2 = ConnectionResponse.builder().id(2L).name("Prod").build();
        List<ConnectionResponse> connections = Arrays.asList(conn1, conn2);

        given(connectionService.getAllConnections()).willReturn(connections);

        // When
        mockMvc.perform(get("/api/connections"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    public void getConnection_ShouldReturnConnection() throws Exception {
        // Given
        ConnectionResponse conn = ConnectionResponse.builder().id(1L).name("Local").build();

        given(connectionService.getConnection(1L)).willReturn(conn);

        // When
        mockMvc.perform(get("/api/connections/1"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Local"));
    }

    @Test
    public void createConnection_ShouldReturnCreatedConnection() throws Exception {
        // Given
        ConnectionRequest request = ConnectionRequest.builder()
                .name("New Connection")
                .bootstrapServers("localhost:9092")
                .build();

        ConnectionResponse response = ConnectionResponse.builder()
                .id(1L)
                .name("New Connection")
                .bootstrapServers("localhost:9092")
                .build();

        given(connectionService.createConnection(any(ConnectionRequest.class))).willReturn(response);

        // When
        mockMvc.perform(post("/api/connections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Connection"));
    }

    @Test
    public void updateConnection_ShouldReturnUpdatedConnection() throws Exception {
        // Given
        ConnectionRequest request = ConnectionRequest.builder()
                .name("Updated Connection")
                .bootstrapServers("localhost:9092")
                .build();

        ConnectionResponse response = ConnectionResponse.builder()
                .id(1L)
                .name("Updated Connection")
                .bootstrapServers("localhost:9092")
                .build();

        given(connectionService.updateConnection(eq(1L), any(ConnectionRequest.class))).willReturn(response);

        // When
        mockMvc.perform(put("/api/connections/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Connection"));
    }

    @Test
    public void deleteConnection_ShouldReturnSuccess() throws Exception {
        // Given
        doNothing().when(connectionService).deleteConnection(1L);

        // When
        mockMvc.perform(delete("/api/connections/1"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
