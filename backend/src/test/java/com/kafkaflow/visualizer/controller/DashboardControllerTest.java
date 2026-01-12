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
                // Connections
                .totalConnections(5)
                .activeConnections(3)
                // Topics
                .totalTopics(10)
                .monitoredTopics(8)
                // Consumers
                .activeConsumers(8)
                .runningThreads(8)
                // Messages - Temps réel
                .messagesPerSecond(12.5)
                .messagesLastMinute(750L)
                .messagesLastHour(45000L)
                // Messages - Historique
                .messagesLast24h(500L)
                .totalMessagesStored(1000L)
                .build();

        given(dashboardService.getDashboardStats()).willReturn(stats);

        // When & Then
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                // Connections
                .andExpect(jsonPath("$.data.totalConnections").value(5))
                .andExpect(jsonPath("$.data.activeConnections").value(3))
                // Topics
                .andExpect(jsonPath("$.data.totalTopics").value(10))
                .andExpect(jsonPath("$.data.monitoredTopics").value(8))
                // Consumers
                .andExpect(jsonPath("$.data.activeConsumers").value(8))
                .andExpect(jsonPath("$.data.runningThreads").value(8))
                // Messages - Temps réel
                .andExpect(jsonPath("$.data.messagesPerSecond").value(12.5))
                .andExpect(jsonPath("$.data.messagesLastMinute").value(750))
                .andExpect(jsonPath("$.data.messagesLastHour").value(45000))
                // Messages - Historique
                .andExpect(jsonPath("$.data.messagesLast24h").value(500))
                .andExpect(jsonPath("$.data.totalMessagesStored").value(1000));
    }
}