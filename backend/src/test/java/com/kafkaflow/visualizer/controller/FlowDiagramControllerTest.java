package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.service.FlowDiagramService;
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

@WebMvcTest(FlowDiagramController.class)
public class FlowDiagramControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FlowDiagramService flowDiagramService;

    @Test
    public void getAllFlows_ShouldReturnList() throws Exception {
        // Given
        FlowDto.FlowDiagramResponse flow1 = FlowDto.FlowDiagramResponse.builder().id(1L).name("Flow 1").build();
        FlowDto.FlowDiagramResponse flow2 = FlowDto.FlowDiagramResponse.builder().id(2L).name("Flow 2").build();
        List<FlowDto.FlowDiagramResponse> flows = Arrays.asList(flow1, flow2);

        given(flowDiagramService.getAllFlows()).willReturn(flows);

        // When
        mockMvc.perform(get("/api/flows"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].name").value("Flow 1"))
                .andExpect(jsonPath("$.data[1].name").value("Flow 2"));
    }

    @Test
    public void getFlowById_ShouldReturnFlow() throws Exception {
        // Given
        FlowDto.FlowDiagramResponse flow = FlowDto.FlowDiagramResponse.builder().id(1L).name("Flow 1").build();

        given(flowDiagramService.getFlowById(1L)).willReturn(flow);

        // When
        mockMvc.perform(get("/api/flows/1"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Flow 1"));
    }

    @Test
    public void createFlow_ShouldReturnCreatedFlow() throws Exception {
        // Given
        FlowDto.CreateFlowRequest request = FlowDto.CreateFlowRequest.builder()
                .name("New Flow")
                .description("Description")
                .build();
        
        FlowDto.FlowDiagramResponse response = FlowDto.FlowDiagramResponse.builder()
                .id(1L)
                .name("New Flow")
                .description("Description")
                .build();

        given(flowDiagramService.createFlow(any(FlowDto.CreateFlowRequest.class))).willReturn(response);

        // When
        mockMvc.perform(post("/api/flows")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Flow"));
    }

    @Test
    public void updateFlow_ShouldReturnUpdatedFlow() throws Exception {
        // Given
        FlowDto.UpdateFlowRequest request = FlowDto.UpdateFlowRequest.builder()
                .name("Updated Flow")
                .build();

        FlowDto.FlowDiagramResponse response = FlowDto.FlowDiagramResponse.builder()
                .id(1L)
                .name("Updated Flow")
                .build();

        given(flowDiagramService.updateFlow(eq(1L), any(FlowDto.UpdateFlowRequest.class))).willReturn(response);

        // When
        mockMvc.perform(put("/api/flows/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Flow"));
    }

    @Test
    public void deleteFlow_ShouldReturnSuccess() throws Exception {
        // Given
        doNothing().when(flowDiagramService).deleteFlow(1L);

        // When
        mockMvc.perform(delete("/api/flows/1"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
