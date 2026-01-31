package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.EmailReportRequest;
import com.kafkaflow.visualizer.dto.EmailReportRequest.ReportFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final EmailService emailService;

    public void sendEmailReport(EmailReportRequest request) {
        ReportFormat format = request.getFormat();
        String filename = "kafka-report-" + System.currentTimeMillis() + "." + format.getExtension();

        try {
            byte[] attachment = generateAttachment(request.getMessages(), format);

            emailService.sendEmailWithAttachment(
                    request.getRecipient(),
                    request.getSubject(),
                    request.getBody(),
                    attachment,
                    filename
            );

            log.info("Email report sent to {} with format {}", request.getRecipient(), format);

        } catch (Exception e) {
            log.error("Failed to send email report to {}: {}", request.getRecipient(), e.getMessage());
            throw new RuntimeException("Failed to send email report: " + e.getMessage(), e);
        }
    }

    private byte[] generateAttachment(List<Map<String, Object>> messages, ReportFormat format) throws Exception {
        return switch (format) {
            case JSON -> emailService.convertMessagesToJson(messages);
            case TXT -> emailService.convertMessagesToTxt(messages);
            case PDF -> emailService.convertMessagesToPdf(messages);
            case CSV -> emailService.convertMessagesToCsv(messages);
        };
    }
}