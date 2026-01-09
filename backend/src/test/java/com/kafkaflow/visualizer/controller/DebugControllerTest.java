package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DebugController.class)
public class DebugControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private KafkaConsumerManager consumerManager;

    @Test
    public void getDebugStatus_ShouldReturnStatus() throws Exception {
        // Given
        doNothing().when(jdbcTemplate).execute(anyString());
        given(jdbcTemplate.queryForObject(eq("SELECT COUNT(*) FROM kafka_messages"), eq(Long.class))).willReturn(100L);
        given(jdbcTemplate.queryForObject(eq("SELECT COUNT(*) FROM kafka_topics"), eq(Long.class))).willReturn(10L);
        given(jdbcTemplate.queryForObject(eq("SELECT COUNT(*) FROM kafka_topics WHERE monitored = true"), eq(Long.class))).willReturn(5L);
        
        given(consumerManager.getActiveConsumerCount()).willReturn(5);
        given(consumerManager.getConsumerStatus()).willReturn(Collections.emptyMap());

        // When
        mockMvc.perform(get("/api/debug/status"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.databaseConnection").value("OK"))
                .andExpect(jsonPath("$.totalMessages").value(100))
                .andExpect(jsonPath("$.totalTopics").value(10))
                .andExpect(jsonPath("$.monitoredTopics").value(5))
                .andExpect(jsonPath("$.activeConsumers").value(5));
    }

    @Test
    public void createTables_ShouldReturnMessage() throws Exception {
        // When
        mockMvc.perform(get("/api/debug/create-tables"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }
}
