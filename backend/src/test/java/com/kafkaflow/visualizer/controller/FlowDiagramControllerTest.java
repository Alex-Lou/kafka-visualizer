package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.service.FlowDiagramService;
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
class FlowDiagramControllerTest {

    @Mock
    private FlowDiagramService flowDiagramService;

    @InjectMocks
    private FlowDiagramController flowDiagramController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(flowDiagramController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetAllFlows() throws Exception {
        // Given
        FlowDto.FlowDiagramResponse flowDiagramResponse = new FlowDto.FlowDiagramResponse();
        List<FlowDto.FlowDiagramResponse> flows = Collections.singletonList(flowDiagramResponse);
        when(flowDiagramService.getAllFlows()).thenReturn(flows);

        // When & Then
        mockMvc.perform(get("/api/flows"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetFlowById() throws Exception {
        // Given
        FlowDto.FlowDiagramResponse flowDiagramResponse = new FlowDto.FlowDiagramResponse();
        when(flowDiagramService.getFlowById(anyLong())).thenReturn(flowDiagramResponse);

        // When & Then
        mockMvc.perform(get("/api/flows/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetFlowsByConnection() throws Exception {
        // Given
        FlowDto.FlowDiagramResponse flowDiagramResponse = new FlowDto.FlowDiagramResponse();
        List<FlowDto.FlowDiagramResponse> flows = Collections.singletonList(flowDiagramResponse);
        when(flowDiagramService.getFlowsByConnection(anyLong())).thenReturn(flows);

        // When & Then
        mockMvc.perform(get("/api/flows/connection/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateFlow() throws Exception {
        // Given
        FlowDto.CreateFlowRequest createFlowRequest = new FlowDto.CreateFlowRequest();
        FlowDto.FlowDiagramResponse flowDiagramResponse = new FlowDto.FlowDiagramResponse();
        when(flowDiagramService.createFlow(any(FlowDto.CreateFlowRequest.class))).thenReturn(flowDiagramResponse);

        // When & Then
        mockMvc.perform(post("/api/flows")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createFlowRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateFlow() throws Exception {
        // Given
        FlowDto.UpdateFlowRequest updateFlowRequest = new FlowDto.UpdateFlowRequest();
        FlowDto.FlowDiagramResponse flowDiagramResponse = new FlowDto.FlowDiagramResponse();
        when(flowDiagramService.updateFlow(anyLong(), any(FlowDto.UpdateFlowRequest.class))).thenReturn(flowDiagramResponse);

        // When & Then
        mockMvc.perform(put("/api/flows/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateFlowRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateFlowLayout() throws Exception {
        // Given
        FlowDto.UpdateLayoutRequest updateLayoutRequest = new FlowDto.UpdateLayoutRequest();
        FlowDto.FlowDiagramResponse flowDiagramResponse = new FlowDto.FlowDiagramResponse();
        when(flowDiagramService.updateFlowLayout(anyLong(), any(FlowDto.UpdateLayoutRequest.class))).thenReturn(flowDiagramResponse);

        // When & Then
        mockMvc.perform(put("/api/flows/1/layout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateLayoutRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteFlow() throws Exception {
        // Given
        doNothing().when(flowDiagramService).deleteFlow(anyLong());

        // When & Then
        mockMvc.perform(delete("/api/flows/1"))
                .andExpect(status().isOk());
    }
}
