package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.CleanupDto.*;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.service.CleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller pour le nettoyage des éléments orphelins
 *
 * Endpoints:
 * - GET  /api/cleanup          → Vue d'ensemble (connexions + topics orphelins)
 * - GET  /api/cleanup/count    → Nombre total d'orphelins
 * - DELETE /api/cleanup        → Supprimer les éléments sélectionnés
 * - DELETE /api/cleanup/all    → Supprimer TOUS les orphelins
 */
@RestController
@RequestMapping("/api/cleanup")
@RequiredArgsConstructor
public class CleanupController {

    private final CleanupService cleanupService;

    // ═══════════════════════════════════════════════════════════════════════
    // DETECTION ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/cleanup
     * Récupère la vue d'ensemble de tous les éléments orphelins
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CleanupOverviewResponse>> getCleanupOverview() {
        CleanupOverviewResponse overview = cleanupService.getCleanupOverview();
        return ResponseEntity.ok(ApiResponse.success(overview.getMessage(), overview));
    }

    /**
     * GET /api/cleanup/count
     * Compte le nombre total d'éléments orphelins
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countOrphans() {
        long count = cleanupService.countAllOrphans();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * DELETE /api/cleanup
     * Supprime les éléments orphelins sélectionnés
     *
     * Body: {
     *   "connectionIds": [1, 2, 3],
     *   "topicIds": [4, 5, 6]
     * }
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<CleanupDeleteResponse>> deleteSelected(
            @RequestBody CleanupDeleteRequest request) {
        CleanupDeleteResponse result = cleanupService.deleteSelected(request);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    /**
     * DELETE /api/cleanup/all
     * Supprime TOUS les éléments orphelins (connexions + topics)
     */
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<CleanupDeleteResponse>> deleteAll() {
        CleanupDeleteResponse result = cleanupService.deleteAll();
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }
}