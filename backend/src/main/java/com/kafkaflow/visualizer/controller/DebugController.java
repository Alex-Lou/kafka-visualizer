package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final JdbcTemplate jdbcTemplate;
    private final KafkaConsumerManager consumerManager;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDebugStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            jdbcTemplate.execute("SELECT 1");
            status.put("databaseConnection", "OK");

            try {
                Long totalMessages = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kafka_messages", Long.class);
                Long totalTopics = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kafka_topics", Long.class);
                Long monitoredTopics = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kafka_topics WHERE monitored = true", Long.class);

                status.put("database", "MySQL/H2");
                status.put("totalMessages", totalMessages);
                status.put("totalTopics", totalTopics);
                status.put("monitoredTopics", monitoredTopics);
                status.put("tablesExist", true);
            } catch (Exception e) {
                status.put("tablesExist", false);
                status.put("tablesError", e.getMessage());
            }

            status.put("activeConsumers", consumerManager.getActiveConsumerCount());
            status.put("consumerStatus", consumerManager.getConsumerStatus());

            return ResponseEntity.ok(ApiResponse.success(status));

        } catch (Exception e) {
            status.put("databaseConnection", "FAILED");
            status.put("error", e.getMessage());
            return ResponseEntity.ok(ApiResponse.success("System contains errors", status));
        }
    }
}