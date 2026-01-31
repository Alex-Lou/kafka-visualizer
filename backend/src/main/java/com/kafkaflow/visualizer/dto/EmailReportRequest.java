package com.kafkaflow.visualizer.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailReportRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String recipient;

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must be less than 200 characters")
    private String subject;

    private String body;

    @NotEmpty(message = "At least one message is required")
    private List<Map<String, Object>> messages;

    @Builder.Default
    private ReportFormat format = ReportFormat.CSV;

    public enum ReportFormat {
        CSV, JSON, TXT, PDF;

        public String getExtension() {
            return name().toLowerCase();
        }
    }
}