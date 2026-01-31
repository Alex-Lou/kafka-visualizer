package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.service.retention.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.kafkaflow.visualizer.dto.RetentionDto.formatBytes;

@RestController
@RequestMapping("/api/retention/actions")
@RequiredArgsConstructor
public class RetentionActionController {

    private final RetentionArchiveService archiveService;
    private final RetentionStatsService statsService;
    private final RetentionManualService manualService;

    @PostMapping("/archive")
    public ResponseEntity<JobLogResponse> triggerArchive() {
        RetentionJobLog job = archiveService.archiveOldMessages();
        return ResponseEntity.ok(toJobLogResponse(job));
    }

    @PostMapping("/purge")
    public ResponseEntity<JobLogResponse> triggerPurge() {
        RetentionJobLog job = archiveService.purgeExpiredArchives();
        return ResponseEntity.ok(toJobLogResponse(job));
    }

    @PostMapping("/aggregate-stats")
    public ResponseEntity<JobLogResponse> triggerStatsAggregation() {
        RetentionJobLog job = statsService.aggregateStats();
        return ResponseEntity.ok(toJobLogResponse(job));
    }

    @PostMapping("/reset-topic/{topicId}")
    public ResponseEntity<Map<String, Object>> resetTopic(
            @PathVariable Long topicId,
            @RequestBody(required = false) ResetTopicRequest request) {

        boolean deleteArchives = request != null && request.isDeleteArchives();
        int deleted = manualService.resetTopic(topicId, deleteArchives);

        return ResponseEntity.ok(Map.of(
                "topicId", topicId,
                "messagesDeleted", deleted,
                "archivesDeleted", deleteArchives
        ));
    }

    @PostMapping("/archive-topic/{topicId}")
    public ResponseEntity<Map<String, Object>> archiveTopic(@PathVariable Long topicId) {
        int archived = manualService.archiveTopicMessages(topicId);
        return ResponseEntity.ok(Map.of(
                "topicId", topicId,
                "messagesArchived", archived
        ));
    }

    @PostMapping("/archive-messages")
    public ResponseEntity<Map<String, Object>> archiveMessages(@RequestBody List<Long> messageIds) {
        int archived = manualService.archiveSpecificMessages(messageIds);
        return ResponseEntity.ok(Map.of(
                "messagesArchived", archived
        ));
    }

    @PostMapping("/bookmark/{messageId}")
    public ResponseEntity<Void> bookmarkMessage(
            @PathVariable Long messageId,
            @RequestParam boolean bookmarked) {
        manualService.bookmarkMessage(messageId, bookmarked);
        return ResponseEntity.ok().build();
    }

    // =========================================================================
    // HELPER
    // =========================================================================

    private JobLogResponse toJobLogResponse(RetentionJobLog log) {
        return JobLogResponse.builder()
                .id(log.getId())
                .jobType(log.getJobType().name())
                .status(log.getStatus().name())
                .messagesProcessed(log.getMessagesProcessed())
                .messagesArchived(log.getMessagesArchived())
                .messagesDeleted(log.getMessagesDeleted())
                .bytesFreed(log.getBytesFreed())
                .bytesFreedFormatted(formatBytes(log.getBytesFreed()))
                .startedAt(log.getStartedAt())
                .completedAt(log.getCompletedAt())
                .durationMs(log.getDurationMs())
                .errorMessage(log.getErrorMessage())
                .build();
    }
}