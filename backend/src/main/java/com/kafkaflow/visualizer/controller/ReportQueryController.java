package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.service.KafkaTopicService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/report-query")
@RequiredArgsConstructor
public class ReportQueryController {

    private final KafkaTopicService topicService;

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessagesForReport(@RequestBody ReportQueryRequest request) {
        log.info("Received request for messages report with topic IDs: {}", request.getTopicIds());

        if (request.getTopicIds() == null || request.getTopicIds().isEmpty()) {
            log.warn("No topic IDs provided in request");
            return ResponseEntity.badRequest().body(ApiResponse.error("No topic IDs provided"));
        }

        try {
            List<MessageResponse> messages = topicService.getMessagesForReport(request.getTopicIds());

            log.info("Successfully retrieved {} messages for report from topics {}",
                    messages != null ? messages.size() : 0,
                    request.getTopicIds());

            if (messages == null || messages.isEmpty()) {
                log.warn("No messages found for the provided topic IDs: {}", request.getTopicIds());
            }

            return ResponseEntity.ok(ApiResponse.success(messages));

        } catch (Exception e) {
            log.error("Error retrieving messages for report from topics {}: {}",
                    request.getTopicIds(),
                    e.getMessage(),
                    e);
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Failed to retrieve messages: " + e.getMessage())
            );
        }
    }

    @Data
    public static class ReportQueryRequest {
        private List<Long> topicIds;
    }
}
