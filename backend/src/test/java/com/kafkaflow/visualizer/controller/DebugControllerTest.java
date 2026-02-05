package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print; //  Indispensable pour voir le JSON
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DebugControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private KafkaConsumerManager consumerManager;

    @BeforeEach
    void setup() {
        // 1. Configuration Robuste de Jackson
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Trouve automatiquement JavaTimeModule
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // Force le format ISO

        // 2. Création du Converter avec cet ObjectMapper précis
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(objectMapper);

        // 3. Setup MockMvc avec logs (print) et converter
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(new DebugController(jdbcTemplate, consumerManager))
                .setMessageConverters(converter)
                .alwaysDo(print()) // Affiche le Request/Response dans la console à chaque test
                .build();
    }

    @Test
    void shouldReturnHealthyStatus_WhenSystemIsUp() throws Exception {
        // GIVEN
        doNothing().when(jdbcTemplate).execute(anyString());

        // Utilisation de anyString() pour garantir que le mock répond, peu importe la requête exacte
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class))).thenReturn(100L);

        when(consumerManager.getActiveConsumerCount()).thenReturn(3);
        when(consumerManager.getConsumerStatus()).thenReturn(Collections.emptyMap());

        // WHEN
        mockMvc.perform(get("/api/debug/status"))
                .andExpect(status().isOk())
                // Si ça échoue ici, regarde les logs "MockHttpServletResponse" juste au-dessus
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.databaseConnection").value("OK"))
                .andExpect(jsonPath("$.data.totalMessages").value(100));
    }

    @Test
    void shouldReturnErrorStatus_WhenDatabaseIsDown() throws Exception {
        // GIVEN
        doThrow(new RuntimeException("Connection refused")).when(jdbcTemplate).execute(anyString());

        // WHEN
        mockMvc.perform(get("/api/debug/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.databaseConnection").value("FAILED"))
                .andExpect(jsonPath("$.data.error").value("Connection refused"));
    }

    @Test
    void shouldHandleMissingTables_Gracefully() throws Exception {
        // GIVEN
        doNothing().when(jdbcTemplate).execute(anyString());

        // Simule l'erreur SQL spécifique
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class)))
                .thenThrow(new RuntimeException("Table 'kafka_messages' doesn't exist"));

        // WHEN
        mockMvc.perform(get("/api/debug/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.databaseConnection").value("OK"))
                .andExpect(jsonPath("$.data.tablesExist").value(false))
                .andExpect(jsonPath("$.data.tablesError").exists());
    }
}