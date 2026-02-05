package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.StatsResponse;
import com.kafkaflow.visualizer.mapper.RetentionDtoMapper;
import com.kafkaflow.visualizer.service.retention.RetentionStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/retention/stats")
@RequiredArgsConstructor
public class RetentionStatsController {

    private final RetentionStatsService statsService;
    private final RetentionDtoMapper mapper;

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<List<StatsResponse>>> getTopicStats(
            @PathVariable Long topicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        List<StatsResponse> stats = statsService.getStatsForTopic(topicId, start, end).stream()
                .map(mapper::toStatsResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/aggregate")
    public ResponseEntity<ApiResponse<Void>> triggerAggregation() {
        statsService.aggregateStats();
        return ResponseEntity.ok(ApiResponse.success("Aggregation job triggered", null));
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<ApiResponse<Void>> triggerCleanup() {
        statsService.cleanupOldStats();
        return ResponseEntity.ok(ApiResponse.success("Cleanup job triggered", null));
    }
}