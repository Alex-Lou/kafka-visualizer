package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.model.RetentionJobLog;
import com.kafkaflow.visualizer.repository.RetentionJobLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static com.kafkaflow.visualizer.dto.RetentionDto.formatBytes;

@RestController
@RequestMapping("/api/retention/jobs")
@RequiredArgsConstructor
public class RetentionJobController {

    private final RetentionJobLogRepository jobLogRepository;

    @GetMapping
    public ResponseEntity<Page<JobLogResponse>> getJobLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RetentionJobLog> logs = jobLogRepository.findAllByOrderByStartedAtDesc(
                PageRequest.of(page, size));
        return ResponseEntity.ok(logs.map(this::toJobLogResponse));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getJobStats() {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        Map<String, Object> stats = jobLogRepository.getJobStatsSince(since);

        Optional<RetentionJobLog> lastArchive = jobLogRepository
                .findTopByJobTypeAndStatusOrderByStartedAtDesc(
                        RetentionJobLog.JobType.ARCHIVE,
                        RetentionJobLog.JobStatus.COMPLETED);

        stats.put("lastArchiveAt", lastArchive.map(RetentionJobLog::getCompletedAt).orElse(null));
        stats.put("bytesFreedFormatted", formatBytes(
                stats.get("totalBytesFreed") != null ?
                        ((Number) stats.get("totalBytesFreed")).longValue() : 0L));

        return ResponseEntity.ok(stats);
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