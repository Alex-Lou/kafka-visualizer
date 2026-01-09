package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.EmailReportRequest;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<Void>> sendEmailReport(@RequestBody EmailReportRequest request) {
        try {
            String format = request.getFormat() != null ? request.getFormat().toLowerCase() : "csv";
            byte[] attachment;
            String filename = "kafka-report-" + System.currentTimeMillis() + "." + format;

            switch (format) {
                case "json":
                    attachment = emailService.convertMessagesToJson(request.getMessages());
                    break;
                case "txt":
                    attachment = emailService.convertMessagesToTxt(request.getMessages());
                    break;
                case "pdf":
                    attachment = emailService.convertMessagesToPdf(request.getMessages());
                    break;
                case "csv":
                default:
                    attachment = emailService.convertMessagesToCsv(request.getMessages());
                    break;
            }

            emailService.sendEmailWithAttachment(
                    request.getRecipient(),
                    request.getSubject(),
                    request.getBody(),
                    attachment,
                    filename
            );

            log.info("Email report sent successfully to {} with format {}", request.getRecipient(), format);
            return ResponseEntity.ok(ApiResponse.success("Email report sent successfully", null));

        } catch (MessagingException e) {
            log.error("Failed to send email report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send email: " + e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to generate attachment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate attachment: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error while sending email report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred: " + e.getMessage()));
        }
    }
}
