package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.EmailReportRequest;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/email")
    public ApiResponse<Void> sendEmailReport(@Valid @RequestBody EmailReportRequest request) {
        reportService.sendEmailReport(request);
        return ApiResponse.success("Email report sent successfully", null);
    }
}