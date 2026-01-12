package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.repository.*;
import com.kafkaflow.visualizer.service.MessageRetentionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.kafkaflow.visualizer.dto.RetentionDto.formatBytes;

@RestController
@RequestMapping("/api/retention")
@RequiredArgsConstructor
@Slf4j
public class RetentionController {

    private final MessageRetentionService retentionService;
    private final RetentionPolicyRepository policyRepository;
    private final KafkaMessageArchiveRepository archiveRepository;
    private final KafkaMessageStatsRepository statsRepository;
    private final RetentionJobLogRepository jobLogRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;
    private final KafkaConnectionRepository connectionRepository;

    // =========================================================================
    // POLICY ENDPOINTS
    // =========================================================================

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyResponse>> getAllPolicies() {
        List<RetentionPolicy> policies = policyRepository.findByIsActiveTrueOrderByPriorityDesc();
        return ResponseEntity.ok(policies.stream()
                .map(this::toPolicyResponse)
                .toList());
    }

    @GetMapping("/policies/global")
    public ResponseEntity<PolicyResponse> getGlobalPolicy() {
        RetentionPolicy policy = policyRepository.findGlobalPolicy()
                .orElseGet(this::createDefaultGlobalPolicy);
        return ResponseEntity.ok(toPolicyResponse(policy));
    }

    @GetMapping("/policies/topic/{topicId}")
    public ResponseEntity<PolicyResponse> getTopicPolicy(@PathVariable Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        RetentionPolicy policy = policyRepository
                .findEffectivePolicy(topicId, topic.getConnection().getId())
                .orElseGet(this::createDefaultGlobalPolicy);

        return ResponseEntity.ok(toPolicyResponse(policy));
    }

    @PostMapping("/policies")
    public ResponseEntity<PolicyResponse> createPolicy(@RequestBody CreatePolicyRequest request) {
        RetentionPolicy policy = RetentionPolicy.builder()
                .topicId(request.getTopicId())
                .connectionId(request.getConnectionId())
                .policyName(request.getPolicyName())
                .hotRetentionHours(request.getHotRetentionHours() != null ? request.getHotRetentionHours() : 168)
                .hotMaxMessages(request.getHotMaxMessages() != null ? request.getHotMaxMessages() : 100000)
                .hotMaxSizeMb(request.getHotMaxSizeMb() != null ? request.getHotMaxSizeMb() : 1000)
                .archiveEnabled(request.getArchiveEnabled() != null ? request.getArchiveEnabled() : true)
                .archiveRetentionDays(request.getArchiveRetentionDays() != null ? request.getArchiveRetentionDays() : 90)
                .archiveCompress(request.getArchiveCompress() != null ? request.getArchiveCompress() : true)
                .statsEnabled(request.getStatsEnabled() != null ? request.getStatsEnabled() : true)
                .statsRetentionDays(request.getStatsRetentionDays() != null ? request.getStatsRetentionDays() : 365)
                .autoPurgeEnabled(request.getAutoPurgeEnabled() != null ? request.getAutoPurgeEnabled() : true)
                .purgeBookmarked(request.getPurgeBookmarked() != null ? request.getPurgeBookmarked() : false)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .isActive(true)
                .build();

        return ResponseEntity.ok(toPolicyResponse(policyRepository.save(policy)));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<PolicyResponse> updatePolicy(
            @PathVariable Long id,
            @RequestBody UpdatePolicyRequest request) {

        RetentionPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (request.getPolicyName() != null) policy.setPolicyName(request.getPolicyName());
        if (request.getHotRetentionHours() != null) policy.setHotRetentionHours(request.getHotRetentionHours());
        if (request.getHotMaxMessages() != null) policy.setHotMaxMessages(request.getHotMaxMessages());
        if (request.getHotMaxSizeMb() != null) policy.setHotMaxSizeMb(request.getHotMaxSizeMb());
        if (request.getArchiveEnabled() != null) policy.setArchiveEnabled(request.getArchiveEnabled());
        if (request.getArchiveRetentionDays() != null) policy.setArchiveRetentionDays(request.getArchiveRetentionDays());
        if (request.getArchiveCompress() != null) policy.setArchiveCompress(request.getArchiveCompress());
        if (request.getStatsEnabled() != null) policy.setStatsEnabled(request.getStatsEnabled());
        if (request.getStatsRetentionDays() != null) policy.setStatsRetentionDays(request.getStatsRetentionDays());
        if (request.getAutoPurgeEnabled() != null) policy.setAutoPurgeEnabled(request.getAutoPurgeEnabled());
        if (request.getPurgeBookmarked() != null) policy.setPurgeBookmarked(request.getPurgeBookmarked());
        if (request.getPriority() != null) policy.setPriority(request.getPriority());
        if (request.getIsActive() != null) policy.setIsActive(request.getIsActive());

        return ResponseEntity.ok(toPolicyResponse(policyRepository.save(policy)));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // =========================================================================
    // STORAGE ENDPOINTS
    // =========================================================================

    @GetMapping("/storage")
    public ResponseEntity<GlobalStorageResponse> getGlobalStorage() {
        List<KafkaTopic> topics = topicRepository.findAll();

        long totalHotMessages = 0;
        long totalHotSize = 0;
        long totalArchiveMessages = 0;
        long totalArchiveSize = 0;

        List<StorageUsageResponse> topicUsages = new ArrayList<>();

        for (KafkaTopic topic : topics) {
            long hotCount = messageRepository.countByTopicId(topic.getId());
            long archiveCount = archiveRepository.countByTopicId(topic.getId());
            Long archiveSize = archiveRepository.getTotalSizeByTopicId(topic.getId());

            totalHotMessages += hotCount;
            totalArchiveMessages += archiveCount;
            totalArchiveSize += archiveSize != null ? archiveSize : 0;

            topicUsages.add(StorageUsageResponse.builder()
                    .topicId(topic.getId())
                    .topicName(topic.getName())
                    .connectionId(topic.getConnection().getId())
                    .connectionName(topic.getConnection().getName())
                    .hotMessageCount(hotCount)
                    .archiveMessageCount(archiveCount)
                    .archiveSizeBytes(archiveSize != null ? archiveSize : 0)
                    .archiveSizeFormatted(formatBytes(archiveSize != null ? archiveSize : 0))
                    .totalMessageCount(hotCount + archiveCount)
                    .build());
        }

        // Get last job info
        Optional<RetentionJobLog> lastCleanup = jobLogRepository
                .findTopByJobTypeAndStatusOrderByStartedAtDesc(
                        RetentionJobLog.JobType.ARCHIVE,
                        RetentionJobLog.JobStatus.COMPLETED);

        return ResponseEntity.ok(GlobalStorageResponse.builder()
                .totalHotMessages(totalHotMessages)
                .totalHotSizeBytes(totalHotSize)
                .totalHotSizeFormatted(formatBytes(totalHotSize))
                .totalArchiveMessages(totalArchiveMessages)
                .totalArchiveSizeBytes(totalArchiveSize)
                .totalArchiveSizeFormatted(formatBytes(totalArchiveSize))
                .totalMessages(totalHotMessages + totalArchiveMessages)
                .totalSizeBytes(totalHotSize + totalArchiveSize)
                .totalSizeFormatted(formatBytes(totalHotSize + totalArchiveSize))
                .lastCleanupAt(lastCleanup.map(RetentionJobLog::getCompletedAt).orElse(null))
                .topicUsages(topicUsages)
                .build());
    }

    @GetMapping("/storage/topic/{topicId}")
    public ResponseEntity<StorageUsageResponse> getTopicStorage(@PathVariable Long topicId) {
        try {
            KafkaTopic topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new RuntimeException("Topic not found"));

            long hotCount = messageRepository.countByTopicId(topicId);
            long archiveCount = archiveRepository.countByTopicId(topicId);
            Long archiveSize = archiveRepository.getTotalSizeByTopicId(topicId);

            Object archiveStatsRaw = null;
            LocalDateTime oldestArchive = null;
            LocalDateTime newestArchive = null;

            try {
                archiveStatsRaw = archiveRepository.getArchiveStatsByTopicId(topicId);

                if (archiveStatsRaw != null && archiveStatsRaw instanceof Object[]) {
                    Object[] statsArray = (Object[]) archiveStatsRaw;
                    // statsArray[0] = topicId, [1] = topicName, [2] = messageCount,
                    // [3] = totalSize, [4] = oldestMessage, [5] = newestMessage
                    if (statsArray.length >= 6) {
                        oldestArchive = (LocalDateTime) statsArray[4];
                        newestArchive = (LocalDateTime) statsArray[5];
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to get archive stats for topic {}: {}", topicId, e.getMessage());
            }

            RetentionPolicy policy = policyRepository
                    .findEffectivePolicy(topicId, topic.getConnection().getId())
                    .orElse(null);

            return ResponseEntity.ok(StorageUsageResponse.builder()
                    .topicId(topic.getId())
                    .topicName(topic.getName())
                    .connectionId(topic.getConnection().getId())
                    .connectionName(topic.getConnection().getName())
                    .hotMessageCount(hotCount)
                    .archiveMessageCount(archiveCount)
                    .archiveSizeBytes(archiveSize != null ? archiveSize : 0)
                    .archiveSizeFormatted(formatBytes(archiveSize != null ? archiveSize : 0))
                    .oldestArchive(oldestArchive)
                    .newestArchive(newestArchive)
                    .totalMessageCount(hotCount + archiveCount)
                    .effectivePolicyName(policy != null ? policy.getPolicyName() : "Default")
                    .hotRetentionHours(policy != null ? policy.getHotRetentionHours() : 168)
                    .archiveRetentionDays(policy != null ? policy.getArchiveRetentionDays() : 90)
                    .build());
        } catch (Exception e) {
            log.error("Error getting topic storage for topicId {}: {}", topicId, e.getMessage(), e);
            throw e;
        }
    }

    // =========================================================================
    // ACTION ENDPOINTS
    // =========================================================================

    @PostMapping("/actions/archive")
    public ResponseEntity<JobLogResponse> triggerArchive() {
        RetentionJobLog job = retentionService.archiveOldMessages();
        return ResponseEntity.ok(toJobLogResponse(job));
    }

    @PostMapping("/actions/purge")
    public ResponseEntity<JobLogResponse> triggerPurge() {
        RetentionJobLog job = retentionService.purgeExpiredArchives();
        return ResponseEntity.ok(toJobLogResponse(job));
    }

    @PostMapping("/actions/aggregate-stats")
    public ResponseEntity<JobLogResponse> triggerStatsAggregation() {
        RetentionJobLog job = retentionService.aggregateStats();
        return ResponseEntity.ok(toJobLogResponse(job));
    }

    @PostMapping("/actions/reset-topic/{topicId}")
    public ResponseEntity<Map<String, Object>> resetTopic(
            @PathVariable Long topicId,
            @RequestBody(required = false) ResetTopicRequest request) {

        boolean deleteArchives = request != null && request.isDeleteArchives();
        int deleted = retentionService.resetTopic(topicId, deleteArchives);

        return ResponseEntity.ok(Map.of(
                "topicId", topicId,
                "messagesDeleted", deleted,
                "archivesDeleted", deleteArchives
        ));
    }

    @PostMapping("/actions/archive-topic/{topicId}")
    public ResponseEntity<Map<String, Object>> archiveTopic(@PathVariable Long topicId) {
        int archived = retentionService.archiveTopicMessages(topicId);
        return ResponseEntity.ok(Map.of(
                "topicId", topicId,
                "messagesArchived", archived
        ));
    }

    @PostMapping("/actions/archive-messages")
    public ResponseEntity<Map<String, Object>> archiveMessages(@RequestBody List<Long> messageIds) {
        int archived = retentionService.archiveSpecificMessages(messageIds);
        return ResponseEntity.ok(Map.of(
                "messagesArchived", archived
        ));
    }

    @PostMapping("/messages/{messageId}/bookmark")
    public ResponseEntity<Void> bookmarkMessage(
            @PathVariable Long messageId,
            @RequestParam boolean bookmarked) {
        retentionService.bookmarkMessage(messageId, bookmarked);
        return ResponseEntity.ok().build();
    }

    // =========================================================================
    // ARCHIVE ENDPOINTS
    // =========================================================================

    @GetMapping("/archives")
    public ResponseEntity<Page<ArchiveMessageResponse>> getArchives(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KafkaMessageArchive> archives;

        if (topicId != null && search != null && !search.isEmpty()) {
            archives = archiveRepository.searchByTopicAndContent(topicId, search, pageable);
        } else if (topicId != null) {
            archives = archiveRepository.findByTopicIdOrderByOriginalTimestampDesc(topicId, pageable);

        } else {
            archives = archiveRepository.findAll(pageable);
        }

        return ResponseEntity.ok(archives.map(this::toArchiveResponse));
    }

    @GetMapping("/archives/{id}")
    public ResponseEntity<ArchiveMessageResponse> getArchive(@PathVariable Long id) {
        KafkaMessageArchive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archive not found"));
        return ResponseEntity.ok(toArchiveResponse(archive));
    }

    // =========================================================================
    // STATS ENDPOINTS
    // =========================================================================

    @GetMapping("/stats/topic/{topicId}")
    public ResponseEntity<AggregatedStatsResponse> getTopicStats(
            @PathVariable Long topicId,
            @RequestParam(defaultValue = "24") int hours) {

        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        Map<String, Object> aggregated = statsRepository.getAggregatedStatsByTopicId(topicId, since);
        List<KafkaMessageStats> hourly = statsRepository.getHourlyStats(topicId, since);

        return ResponseEntity.ok(AggregatedStatsResponse.builder()
                .topicId(topicId)
                .topicName(topic.getName())
                .timeRange(hours + " hours")
                .totalMessages(aggregated.get("totalMessages") != null ?
                        ((Number) aggregated.get("totalMessages")).longValue() : 0L)
                .totalErrors(aggregated.get("totalErrors") != null ?
                        ((Number) aggregated.get("totalErrors")).longValue() : 0L)
                .totalWarnings(aggregated.get("totalWarnings") != null ?
                        ((Number) aggregated.get("totalWarnings")).longValue() : 0L)
                .totalSizeBytes(aggregated.get("totalSize") != null ?
                        ((Number) aggregated.get("totalSize")).longValue() : 0L)
                .avgThroughput(aggregated.get("avgThroughput") != null ?
                        ((Number) aggregated.get("avgThroughput")).doubleValue() : 0.0)
                .peakThroughput(aggregated.get("peakThroughput") != null ?
                        ((Number) aggregated.get("peakThroughput")).intValue() : 0)
                .hourlyBreakdown(hourly.stream().map(this::toStatsResponse).toList())
                .build());
    }

    @GetMapping("/stats/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);

        Map<String, Object> global = statsRepository.getGlobalAggregatedStats(since24h);
        List<Object[]> topByVolume = statsRepository.getTopTopicsByMessageCount(since24h);
        List<Object[]> topByErrors = statsRepository.getTopTopicsByErrorCount(since24h);

        // Convert top topics
        List<TopicStatsResponse> topTopics = topByVolume.stream()
                .limit(5)
                .map(row -> {
                    Long tId = ((Number) row[0]).longValue();
                    Long count = ((Number) row[1]).longValue();
                    String name = topicRepository.findById(tId)
                            .map(KafkaTopic::getName).orElse("Unknown");
                    return TopicStatsResponse.builder()
                            .topicId(tId)
                            .topicName(name)
                            .messageCount(count)
                            .build();
                })
                .toList();

        List<TopicStatsResponse> topErrors = topByErrors.stream()
                .limit(5)
                .map(row -> {
                    Long tId = ((Number) row[0]).longValue();
                    Long count = ((Number) row[1]).longValue();
                    String name = topicRepository.findById(tId)
                            .map(KafkaTopic::getName).orElse("Unknown");
                    return TopicStatsResponse.builder()
                            .topicId(tId)
                            .topicName(name)
                            .errorCount(count)
                            .build();
                })
                .toList();

        return ResponseEntity.ok(DashboardStatsResponse.builder()
                .totalMessagesLast24h(global.get("totalMessages") != null ?
                        ((Number) global.get("totalMessages")).longValue() : 0L)
                .totalErrorsLast24h(global.get("totalErrors") != null ?
                        ((Number) global.get("totalErrors")).longValue() : 0L)
                .totalWarningsLast24h(global.get("totalWarnings") != null ?
                        ((Number) global.get("totalWarnings")).longValue() : 0L)
                .currentThroughput(global.get("avgThroughput") != null ?
                        ((Number) global.get("avgThroughput")).doubleValue() : 0.0)
                .topTopicsByVolume(topTopics)
                .topTopicsByErrors(topErrors)
                .build());
    }

    // =========================================================================
    // JOB LOG ENDPOINTS
    // =========================================================================

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobLogResponse>> getJobLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RetentionJobLog> logs = jobLogRepository.findAllByOrderByStartedAtDesc(
                PageRequest.of(page, size));
        return ResponseEntity.ok(logs.map(this::toJobLogResponse));
    }

    @GetMapping("/jobs/stats")
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
    // HELPER METHODS
    // =========================================================================

    private RetentionPolicy createDefaultGlobalPolicy() {
        RetentionPolicy policy = RetentionPolicy.builder()
                .policyName("Global Default Policy")
                .hotRetentionHours(168)
                .hotMaxMessages(100000)
                .hotMaxSizeMb(1000)
                .archiveEnabled(true)
                .archiveRetentionDays(90)
                .archiveCompress(true)
                .statsEnabled(true)
                .statsRetentionDays(365)
                .autoPurgeEnabled(true)
                .purgeBookmarked(false)
                .priority(0)
                .isActive(true)
                .build();
        return policyRepository.save(policy);
    }

    private PolicyResponse toPolicyResponse(RetentionPolicy policy) {
        String topicName = null;
        String connectionName = null;

        if (policy.getTopicId() != null) {
            topicName = topicRepository.findById(policy.getTopicId())
                    .map(KafkaTopic::getName).orElse(null);
        }
        if (policy.getConnectionId() != null) {
            connectionName = connectionRepository.findById(policy.getConnectionId())
                    .map(KafkaConnection::getName).orElse(null);
        }

        return PolicyResponse.builder()
                .id(policy.getId())
                .topicId(policy.getTopicId())
                .topicName(topicName)
                .connectionId(policy.getConnectionId())
                .connectionName(connectionName)
                .policyName(policy.getPolicyName())
                .policyScope(policy.getPolicyScope())
                .hotRetentionHours(policy.getHotRetentionHours())
                .hotMaxMessages(policy.getHotMaxMessages())
                .hotMaxSizeMb(policy.getHotMaxSizeMb())
                .archiveEnabled(policy.getArchiveEnabled())
                .archiveRetentionDays(policy.getArchiveRetentionDays())
                .archiveCompress(policy.getArchiveCompress())
                .statsEnabled(policy.getStatsEnabled())
                .statsRetentionDays(policy.getStatsRetentionDays())
                .autoPurgeEnabled(policy.getAutoPurgeEnabled())
                .purgeBookmarked(policy.getPurgeBookmarked())
                .priority(policy.getPriority())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

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

    private StatsResponse toStatsResponse(KafkaMessageStats stats) {
        return StatsResponse.builder()
                .topicId(stats.getTopicId())
                .hourBucket(stats.getHourBucket())
                .messageCount(stats.getMessageCount())
                .normalCount(stats.getNormalCount())
                .errorCount(stats.getErrorCount())
                .warningCount(stats.getWarningCount())
                .systemCount(stats.getSystemCount())
                .totalSizeBytes(stats.getTotalSizeBytes())
                .avgSizeBytes(stats.getAvgSizeBytes())
                .minSizeBytes(stats.getMinSizeBytes())
                .maxSizeBytes(stats.getMaxSizeBytes())
                .messagesPerMinute(stats.getMessagesPerMinute() != null ?
                        stats.getMessagesPerMinute().doubleValue() : 0.0)
                .peakMessagesPerMinute(stats.getPeakMessagesPerMinute())
                .firstMessageAt(stats.getFirstMessageAt())
                .lastMessageAt(stats.getLastMessageAt())
                .build();
    }

    private ArchiveMessageResponse toArchiveResponse(KafkaMessageArchive archive) {
        return ArchiveMessageResponse.builder()
                .id(archive.getId())
                .originalId(archive.getOriginalId())
                .topicId(archive.getTopicId())
                .topicName(archive.getTopicName())
                .connectionId(archive.getConnectionId())
                .connectionName(archive.getConnectionName())
                .partitionNum(archive.getPartition())
                .offsetNum(archive.getOffset())
                .msgKey(archive.getMessageKey())
                .msgValue(archive.getMessageValue())
                .timestamp(archive.getOriginalTimestamp())
                .headers(archive.getHeaders())
                .messageType(archive.getMessageType().name())
                .contentType(archive.getContentType())
                .valueSize(archive.getValueSize())
                .archivedAt(archive.getArchivedAt())
                .archiveReason(archive.getArchiveReason().name())
                .build();
    }
}
