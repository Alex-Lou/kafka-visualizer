package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.KafkaDto.HealthStatus;
import com.kafkaflow.visualizer.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<ApiResponse<HealthStatus>> getHealth() {
        HealthStatus health = healthService.getHealthStatus();

        if ("DOWN".equals(health.getStatus())) {
            return ResponseEntity.status(503).body(ApiResponse.success(health));
        }

        return ResponseEntity.ok(ApiResponse.success(health));
    }

    @GetMapping("/simple")
    public ResponseEntity<String> getSimpleHealth() {
        HealthStatus health = healthService.getHealthStatus();

        if ("DOWN".equals(health.getStatus())) {
            return ResponseEntity.status(503).body("DOWN");
        }

        return ResponseEntity.ok(health.getStatus());
    }
}