package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/retention/stats")
@RequiredArgsConstructor
public class RetentionStatsController {

    private final KafkaMessageStatsRepository statsRepository;
    private final KafkaTopicRepository topicRepository;

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<AggregatedStatsResponse> getTopicStats(
            @PathVariable Long topicId,
            @RequestParam(defaultValue = "24") int hours) {

        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

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

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);

        Map<String, Object> global = statsRepository.getGlobalAggregatedStats(since24h);
        List<Object[]> topByVolume = statsRepository.getTopTopicsByMessageCount(since24h);
        List<Object[]> topByErrors = statsRepository.getTopTopicsByErrorCount(since24h);

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
    // HELPER
    // =========================================================================

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
}