package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.JobLogResponse;
import com.kafkaflow.visualizer.mapper.RetentionDtoMapper;
import com.kafkaflow.visualizer.service.retention.RetentionStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/retention/actions")
@RequiredArgsConstructor
public class RetentionActionController {

    private final RetentionStatsService statsService;
    private final RetentionDtoMapper mapper;

    @PostMapping("/aggregate-stats")
    public ResponseEntity<ApiResponse<JobLogResponse>> triggerStatsAggregation() {
        return ResponseEntity.ok(ApiResponse.success(
                "Stats aggregation completed",
                mapper.toJobLogResponse(statsService.aggregateStats())
        ));
    }
}
