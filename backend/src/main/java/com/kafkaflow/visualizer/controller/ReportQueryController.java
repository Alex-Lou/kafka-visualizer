package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.dto.ReportQueryRequest;
import com.kafkaflow.visualizer.service.kafkatopic.KafkaTopicMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/report-query")
@RequiredArgsConstructor
public class ReportQueryController {

    private final KafkaTopicMessageService messageService;

    @PostMapping("/messages")
    public ApiResponse<List<MessageResponse>> getMessagesForReport(@Valid @RequestBody ReportQueryRequest request) {
        log.info("Fetching messages for topics: {}", request.getTopicIds());
        List<MessageResponse> messages = messageService.getMessagesForReport(request.getTopicIds());
        log.info("Retrieved {} messages", messages.size());
        return ApiResponse.success(messages);
    }
}