package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.DashboardStats;
import com.kafkaflow.visualizer.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    public void getDashboardStats_ShouldReturnStats() throws Exception {
        // Given
        DashboardStats stats = DashboardStats.builder()
                .totalConnections(5)
                .activeConnections(3)
                .totalTopics(10)
                .monitoredTopics(8)
                .totalMessages(1000L)
                .messagesLast24h(500L)
                .build();

        given(dashboardService.getDashboardStats()).willReturn(stats);

        // When
        mockMvc.perform(get("/api/dashboard/stats"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalConnections").value(5))
                .andExpect(jsonPath("$.data.activeConnections").value(3))
                .andExpect(jsonPath("$.data.totalTopics").value(10))
                .andExpect(jsonPath("$.data.monitoredTopics").value(8))
                .andExpect(jsonPath("$.data.totalMessages").value(1000))
                .andExpect(jsonPath("$.data.messagesLast24h").value(500));
    }
}
