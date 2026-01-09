package com.kafkaflow.visualizer.controller;

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
    public ResponseEntity<Map<String, Object>> getDebugStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            // Test database connection
            jdbcTemplate.execute("SELECT 1");
            status.put("databaseConnection", "OK");

            // Check if tables exist
            try {
                Long totalMessages = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kafka_messages", Long.class);
                Long totalTopics = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kafka_topics", Long.class);
                Long monitoredTopics = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kafka_topics WHERE monitored = true", Long.class);

                status.put("database", "MySQL");
                status.put("totalMessages", totalMessages);
                status.put("totalTopics", totalTopics);
                status.put("monitoredTopics", monitoredTopics);
                status.put("tablesExist", true);
            } catch (Exception e) {
                status.put("tablesExist", false);
                status.put("tablesError", e.getMessage());
            }

            // Check consumer status
            status.put("activeConsumers", consumerManager.getActiveConsumerCount());
            status.put("consumerStatus", consumerManager.getConsumerStatus());

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            status.put("databaseConnection", "FAILED");
            status.put("error", e.getMessage());
            return ResponseEntity.ok(status);
        }
    }

    @GetMapping("/create-tables")
    public ResponseEntity<Map<String, Object>> createTables() {
        Map<String, Object> result = new HashMap<>();

        try {
            // This will trigger Hibernate to create tables
            result.put("message", "Tables should be created automatically by Hibernate on next restart");
            result.put("hint", "Check application logs for any Hibernate errors");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }
}
