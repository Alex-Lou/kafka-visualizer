package com.kafkaflow.visualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.EmailReportRequest;
import com.kafkaflow.visualizer.dto.EmailReportRequest.ReportFormat;
import com.kafkaflow.visualizer.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportController.class)
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportService reportService;

    @Test
    public void sendEmailReport_ShouldReturnSuccess() throws Exception {
        // Given
        EmailReportRequest request = EmailReportRequest.builder()
                .recipient("test@example.com")
                .subject("Test Report")
                .body("This is a test report.")
                .format(ReportFormat.CSV)
                .messages(List.of(Map.of("id", 1, "value", "test")))
                .build();

        doNothing().when(reportService).sendEmailReport(any(EmailReportRequest.class));

        // When & Then
        mockMvc.perform(post("/api/report/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Email report sent successfully"));
    }

    @Test
    public void sendEmailReport_ShouldReturn400_WhenRecipientMissing() throws Exception {
        // Given
        EmailReportRequest request = EmailReportRequest.builder()
                .subject("Test Report")
                .messages(List.of(Map.of("id", 1)))
                .build();

        // When & Then
        mockMvc.perform(post("/api/report/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}