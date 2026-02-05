package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.GlobalStorageResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.PurgeRequest;
import com.kafkaflow.visualizer.dto.RetentionDto.StorageUsageResponse;
import com.kafkaflow.visualizer.service.retention.RetentionManualService;
import com.kafkaflow.visualizer.service.retention.RetentionStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retention/storage")
@RequiredArgsConstructor
public class RetentionStorageController {

    private final RetentionStorageService storageService;
    private final RetentionManualService manualService;

    // ═══════════════════════════════════════════════════════════════════════
    // LECTURE (GET)
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping
    public ResponseEntity<ApiResponse<GlobalStorageResponse>> getGlobalStorage() {
        return ResponseEntity.ok(ApiResponse.success(storageService.getGlobalStorage()));
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<StorageUsageResponse>> getTopicStorage(@PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(storageService.getTopicStorage(topicId)));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIONS (POST)
    // ═══════════════════════════════════════════════════════════════════════

    @PostMapping("/topic/{topicId}/archive")
    public ResponseEntity<ApiResponse<Integer>> manualArchive(@PathVariable Long topicId) {
        int count = manualService.archiveTopicMessages(topicId);
        return ResponseEntity.ok(ApiResponse.success("Archived " + count + " messages", count));
    }

    @PostMapping("/topic/{topicId}/reset")
    public ResponseEntity<ApiResponse<Integer>> resetTopic(
            @PathVariable Long topicId,
            @RequestParam(defaultValue = "false") boolean includeArchives) {
        int count = manualService.resetTopic(topicId, includeArchives);
        return ResponseEntity.ok(ApiResponse.success("Topic reset. Deleted " + count + " messages", count));
    }

    @PostMapping("/purge")
    public ResponseEntity<ApiResponse<Integer>> purgeOldMessages(@RequestBody PurgeRequest request) {
        int count = manualService.purgeMessagesOlderThan(request.getOlderThan(), request.isArchiveFirst());
        return ResponseEntity.ok(ApiResponse.success("Purged " + count + " messages", count));
    }

    @PostMapping("/messages/bookmark")
    public ResponseEntity<ApiResponse<Void>> bookmarkMessage(
            @RequestParam Long messageId,
            @RequestParam boolean isBookmarked) {
        manualService.bookmarkMessage(messageId, isBookmarked);
        return ResponseEntity.ok(ApiResponse.success("Message bookmark updated", null));
    }

    @PostMapping("/messages/archive-selection")
    public ResponseEntity<ApiResponse<Integer>> archiveSelection(@RequestBody List<Long> messageIds) {
        int count = manualService.archiveSpecificMessages(messageIds);
        return ResponseEntity.ok(ApiResponse.success("Archived " + count + " selected messages", count));
    }
}