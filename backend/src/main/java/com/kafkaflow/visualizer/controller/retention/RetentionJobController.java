package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.JobLogResponse;
import com.kafkaflow.visualizer.mapper.RetentionDtoMapper;
import com.kafkaflow.visualizer.model.RetentionJobLog.JobType;
import com.kafkaflow.visualizer.repository.RetentionJobLogRepository;
import com.kafkaflow.visualizer.service.retention.RetentionArchiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retention/jobs")
@RequiredArgsConstructor
public class RetentionJobController {

    private final RetentionJobLogRepository jobLogRepository;
    private final RetentionArchiveService archiveService;
    private final RetentionDtoMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobLogResponse>>> getRecentJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<JobLogResponse> jobs = jobLogRepository.findAll(
                        PageRequest.of(page, size, Sort.by("startedAt").descending())
                ).stream()
                .map(mapper::toJobLogResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<JobLogResponse>>> getJobsByType(
            @PathVariable JobType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<JobLogResponse> jobs = jobLogRepository.findByJobType(
                        type, PageRequest.of(page, size, Sort.by("startedAt").descending())
                ).stream()
                .map(mapper::toJobLogResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @PostMapping("/run/archive")
    public ResponseEntity<ApiResponse<JobLogResponse>> runArchiveJob() {
        return ResponseEntity.ok(ApiResponse.success(
                "Archive job finished",
                mapper.toJobLogResponse(archiveService.archiveOldMessages())
        ));
    }

    @PostMapping("/run/purge-archive")
    public ResponseEntity<ApiResponse<JobLogResponse>> runPurgeArchiveJob() {
        return ResponseEntity.ok(ApiResponse.success(
                "Purge job finished",
                mapper.toJobLogResponse(archiveService.purgeExpiredArchives())
        ));
    }
}