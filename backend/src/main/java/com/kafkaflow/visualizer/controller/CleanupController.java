package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.CleanupDto.*;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.service.CleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cleanup")
@RequiredArgsConstructor
public class CleanupController {

    private final CleanupService cleanupService;

    // ═══════════════════════════════════════════════════════════════════════
    // DETECTION ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping
    public ResponseEntity<ApiResponse<CleanupOverviewResponse>> getCleanupOverview() {
        CleanupOverviewResponse overview = cleanupService.getCleanupOverview();
        return ResponseEntity.ok(ApiResponse.success(overview.getMessage(), overview));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countOrphans() {
        long count = cleanupService.countAllOrphans();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @DeleteMapping
    public ResponseEntity<ApiResponse<CleanupDeleteResponse>> deleteSelected(
            @RequestBody CleanupDeleteRequest request) {
        CleanupDeleteResponse result = cleanupService.deleteSelected(request);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<CleanupDeleteResponse>> deleteAll() {
        CleanupDeleteResponse result = cleanupService.deleteAll();
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }
}