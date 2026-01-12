package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.ArchiveDto.*;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import com.kafkaflow.visualizer.service.ArchiveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/archives")
@RequiredArgsConstructor
@Slf4j
public class ArchiveController {

    private final ArchiveService archiveService;

    // ═══════════════════════════════════════════════════════════════════════
    // READ ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get archives with filters and pagination
     */
    @GetMapping
    public ApiResponse<Page<ArchiveResponse>> getArchives(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long connectionId,
            @RequestParam(required = false) String topicName,
            @RequestParam(required = false) String messageKey,
            @RequestParam(required = false) String valueContains,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) MessageType messageType,
            @RequestParam(required = false) ArchiveReason archiveReason,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "originalTimestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        ArchiveFilterRequest filter = ArchiveFilterRequest.builder()
                .topicId(topicId)
                .connectionId(connectionId)
                .topicName(topicName)
                .messageKey(messageKey)
                .valueContains(valueContains)
                .fromDate(fromDate)
                .toDate(toDate)
                .messageType(messageType)
                .archiveReason(archiveReason)
                .contentType(contentType)
                .searchQuery(search)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        Page<ArchiveResponse> archives = archiveService.getArchives(filter);
        return ApiResponse.success(archives);
    }

    /**
     * Get a single archive by ID (full content)
     */
    @GetMapping("/{id}")
    public ApiResponse<ArchiveResponse> getArchiveById(@PathVariable Long id) {
        ArchiveResponse archive = archiveService.getArchiveById(id);
        return ApiResponse.success(archive);
    }

    /**
     * Get archive statistics
     */
    @GetMapping("/stats")
    public ApiResponse<ArchiveStats> getStats() {
        ArchiveStats stats = archiveService.getStats();
        return ApiResponse.success(stats);
    }

    /**
     * Get filter options (for dropdowns)
     */
    @GetMapping("/filters")
    public ApiResponse<FilterOptions> getFilterOptions() {
        FilterOptions options = archiveService.getFilterOptions();
        return ApiResponse.success(options);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Export archives to file (JSON, CSV, NDJSON)
     */
    @PostMapping("/export")
    public ResponseEntity<byte[]> exportArchives(@RequestBody ExportRequest request) {
        ExportResponse export = archiveService.exportArchives(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(export.getContentType()));
        headers.setContentDispositionFormData("attachment", export.getFilename());
        headers.setContentLength(export.getSizeBytes());

        return ResponseEntity.ok()
                .headers(headers)
                .body(export.getData());
    }

    /**
     * Quick export selected archives as JSON
     */
    @GetMapping("/export/json")
    public ResponseEntity<byte[]> exportAsJson(
            @RequestParam(required = false) List<Long> ids,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "false") boolean compress
    ) {
        ExportRequest request = ExportRequest.builder()
                .ids(ids)
                .topicId(topicId)
                .fromDate(fromDate)
                .toDate(toDate)
                .format(ExportFormat.JSON)
                .includeHeaders(true)
                .includeMetadata(true)
                .compress(compress)
                .build();

        return exportArchives(request);
    }

    /**
     * Quick export selected archives as CSV
     */
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportAsCsv(
            @RequestParam(required = false) List<Long> ids,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "false") boolean compress
    ) {
        ExportRequest request = ExportRequest.builder()
                .ids(ids)
                .topicId(topicId)
                .fromDate(fromDate)
                .toDate(toDate)
                .format(ExportFormat.CSV)
                .includeHeaders(true)
                .includeMetadata(false)
                .compress(compress)
                .build();

        return exportArchives(request);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Delete selected archives
     */
    @DeleteMapping
    public ApiResponse<BulkOperationResponse> deleteArchives(@RequestBody BulkDeleteRequest request) {
        BulkOperationResponse response = archiveService.deleteArchives(request);
        return ApiResponse.success(response);
    }

    /**
     * Delete a single archive
     */
    @DeleteMapping("/{id}")
    public ApiResponse<BulkOperationResponse> deleteArchive(@PathVariable Long id) {
        BulkDeleteRequest request = BulkDeleteRequest.builder()
                .ids(List.of(id))
                .build();
        BulkOperationResponse response = archiveService.deleteArchives(request);
        return ApiResponse.success(response);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESTORE ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Restore archived messages back to active
     */
    @PostMapping("/restore")
    public ApiResponse<RestoreResponse> restoreArchives(@RequestBody RestoreRequest request) {
        RestoreResponse response = archiveService.restoreArchives(request);
        return ApiResponse.success(response);
    }
}