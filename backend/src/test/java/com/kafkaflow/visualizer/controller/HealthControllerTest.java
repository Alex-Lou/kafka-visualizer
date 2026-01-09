package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.HealthStatus;
import com.kafkaflow.visualizer.service.HealthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
public class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HealthService healthService;

    @Test
    public void getHealth_ShouldReturnOk_WhenStatusIsUp() throws Exception {
        // Given
        HealthStatus healthStatus = HealthStatus.builder()
                .status("UP")
                .build();

        given(healthService.getHealthStatus()).willReturn(healthStatus);

        // When
        mockMvc.perform(get("/api/health"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    public void getHealth_ShouldReturnServiceUnavailable_WhenStatusIsDown() throws Exception {
        // Given
        HealthStatus healthStatus = HealthStatus.builder()
                .status("DOWN")
                .build();

        given(healthService.getHealthStatus()).willReturn(healthStatus);

        // When
        mockMvc.perform(get("/api/health"))
                // Then
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DOWN"));
    }

    @Test
    public void getSimpleHealth_ShouldReturnOk_WhenStatusIsUp() throws Exception {
        // Given
        HealthStatus healthStatus = HealthStatus.builder()
                .status("UP")
                .build();

        given(healthService.getHealthStatus()).willReturn(healthStatus);

        // When
        mockMvc.perform(get("/api/health/simple"))
                // Then
                .andExpect(status().isOk())
                .andExpect(content().string("UP"));
    }

    @Test
    public void getSimpleHealth_ShouldReturnServiceUnavailable_WhenStatusIsDown() throws Exception {
        // Given
        HealthStatus healthStatus = HealthStatus.builder()
                .status("DOWN")
                .build();

        given(healthService.getHealthStatus()).willReturn(healthStatus);

        // When
        mockMvc.perform(get("/api/health/simple"))
                // Then
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().string("DOWN"));
    }
}
