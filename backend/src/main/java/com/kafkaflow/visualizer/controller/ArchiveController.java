package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.ArchiveDto.*;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.service.archives.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archives")
@RequiredArgsConstructor
@Slf4j
public class ArchiveController {

    private final ArchiveSearchService searchService;
    private final ArchiveStatsService statsService;
    private final ArchiveExportService exportService;
    private final ArchiveActionService actionService;

    // ═══════════════════════════════════════════════════════════════════════
    // READ
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping
    public ApiResponse<Page<ArchiveResponse>> getArchives(@Valid ArchiveFilterRequest filter) {
        return ApiResponse.success(searchService.getArchives(filter));
    }

    @GetMapping("/{id}")
    public ApiResponse<ArchiveResponse> getArchiveById(@PathVariable Long id) {
        return ApiResponse.success(searchService.getArchiveById(id));
    }

    @GetMapping("/stats")
    public ApiResponse<ArchiveStats> getStats() {
        return ApiResponse.success(statsService.getStats());
    }

    @GetMapping("/filters")
    public ApiResponse<FilterOptions> getFilterOptions() {
        return ApiResponse.success(searchService.getFilterOptions());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportArchives(@Valid @RequestBody ExportRequest request) {
        ExportResponse export = exportService.exportArchives(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, export.getContentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + export.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(export.getSizeBytes()))
                .body(export.getData());
    }

    @GetMapping("/export/json")
    public ResponseEntity<byte[]> exportAsJson(@Valid ExportQuickRequest request) {
        return exportArchives(request.toExportRequest(ExportFormat.JSON, true));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportAsCsv(@Valid ExportQuickRequest request) {
        return exportArchives(request.toExportRequest(ExportFormat.CSV, false));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════════════════════════════

    @DeleteMapping
    public ApiResponse<BulkOperationResponse> deleteArchives(@Valid @RequestBody BulkDeleteRequest request) {
        return ApiResponse.success(actionService.deleteArchives(request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<BulkOperationResponse> deleteArchive(@PathVariable Long id) {
        return deleteArchives(BulkDeleteRequest.builder().ids(List.of(id)).build());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESTORE
    // ═══════════════════════════════════════════════════════════════════════

    @PostMapping("/restore")
    public ApiResponse<RestoreResponse> restoreArchives(@Valid @RequestBody RestoreRequest request) {
        return ApiResponse.success(actionService.restoreArchives(request));
    }
}