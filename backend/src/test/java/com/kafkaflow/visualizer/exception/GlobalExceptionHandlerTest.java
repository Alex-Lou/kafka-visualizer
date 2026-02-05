package com.kafkaflow.visualizer.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void shouldHandleKafkaException_WithStaticSimplifier() throws Exception {
        mockMvc.perform(get("/test/kafka-error"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("KAFKA_001")) // KAFKA_CONNECTION_FAILED
                .andExpect(jsonPath("$.message").value("Connection timeout"));
    }

    @Test
    void shouldHandleMailException() throws Exception {
        mockMvc.perform(get("/test/mail-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("EMAIL_SEND_ERROR"))
                .andExpect(jsonPath("$.message").value("Failed to send email"));
    }

    @Test
    void shouldHandleJsonException() throws Exception {
        mockMvc.perform(get("/test/json-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("JSON_CONVERSION_ERROR"));
    }

    // ════════════════════════════════════════════
    // Faux Controller
    // ════════════════════════════════════════════
    @RestController
    static class TestController {

        @GetMapping("/test/kafka-error")
        void throwKafka() {
            throw new KafkaConnectionException(
                    "Timed out waiting for connection",
                    new RuntimeException("Root cause")
            );
        }

        @GetMapping("/test/mail-error")
        void throwMail() throws MessagingException {
            throw new MessagingException("Connection refused to port 25");
        }

        @GetMapping("/test/json-error")
        void throwJson() throws JsonProcessingException {
            throw new MockJsonProcessingException("Error parsing JSON");
        }
    }

    static class MockJsonProcessingException extends JsonProcessingException {
        protected MockJsonProcessingException(String msg) {
            super(msg);
        }
    }
}