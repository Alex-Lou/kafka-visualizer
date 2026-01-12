package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.KafkaTopicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Slf4j
public class KafkaTopicController {

    private final KafkaTopicService topicService;
    private final com.kafkaflow.visualizer.service.KafkaConnectionService connectionService;
    private final KafkaMessageRepository messageRepository;
    private final KafkaTopicRepository topicRepository;

    @GetMapping("/connection/{connectionId}")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopicsByConnection(
            @PathVariable Long connectionId) {
        return ResponseEntity.ok(ApiResponse.success(topicService.getTopicsByConnection(connectionId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> getTopic(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(topicService.getTopic(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> updateTopic(
            @PathVariable Long id,
            @RequestBody TopicUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Topic updated successfully",
                topicService.updateTopic(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(ApiResponse.success("Topic deleted successfully", null));
    }

    @PostMapping("/connection/{connectionId}/sync")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> syncTopics(
            @PathVariable Long connectionId) {
        // Discover topics from Kafka
        List<String> topicNames = connectionService.discoverTopics(connectionId);

        // Sync discovered topics to database
        List<TopicResponse> syncedTopics = topicService.syncTopics(connectionId, topicNames);

        return ResponseEntity.ok(ApiResponse.success(
                "Topics synchronized successfully",
                syncedTopics
        ));
    }

    @GetMapping("/{topicId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getMessages(
            @PathVariable Long topicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String key,
            @RequestParam(required = false) String valueContains,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate) {

        MessageFilter filter = MessageFilter.builder()
                .topicId(topicId)
                .key(key)
                .valueContains(valueContains)
                .fromDate(fromDate)
                .toDate(toDate)
                .page(page)
                .size(size)
                .build();

        return ResponseEntity.ok(ApiResponse.success(topicService.getMessages(filter)));
    }

    @GetMapping("/{topicId}/messages/recent")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getRecentMessages(
            @PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(topicService.getRecentMessages(topicId)));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LIVE STATS ENDPOINT
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/live-stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLiveStats(@PathVariable Long id) {
        try {
            var topic = topicRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Topic not found"));

            // Récupérer les messages récents
            long totalMessages = messageRepository.countByTopicId(id);

            // Messages des dernières 24h
            LocalDateTime last24h = LocalDateTime.now().minusHours(24);
            long messagesLast24h = messageRepository.countByTopicIdAndTimestampAfter(id, last24h);

            // Messages de la dernière heure
            LocalDateTime lastHour = LocalDateTime.now().minusHours(1);
            long messagesLastHour = messageRepository.countByTopicIdAndTimestampAfter(id, lastHour);

            // Errors et warnings
            long errorCount = messageRepository.countByTopicIdAndMessageTypeAndTimestampAfter(
                    id, KafkaMessage.MessageType.ERROR, last24h);
            long warningCount = messageRepository.countByTopicIdAndMessageTypeAndTimestampAfter(
                    id, KafkaMessage.MessageType.WARNING, last24h);

            // Dernier message
            Optional<KafkaMessage> lastMessage = messageRepository
                    .findFirstByTopicIdOrderByTimestampDesc(id);

            // Taille totale (approximation)
            Long totalSize = messageRepository.getTotalSizeByTopicId(id);
            String totalSizeFormatted = formatBytes(totalSize != null ? totalSize : 0);

            // Calculer le throughput (basé sur la dernière minute)
            LocalDateTime lastMinute = LocalDateTime.now().minusMinutes(1);
            long messagesLastMinute = messageRepository.countByTopicIdAndTimestampAfter(id, lastMinute);
            double throughputPerSecond = messagesLastMinute / 60.0;
            double throughputPerMinute = messagesLastMinute;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMessages", totalMessages);
            stats.put("messagesLast24h", messagesLast24h);
            stats.put("messagesLastHour", messagesLastHour);
            stats.put("errorCount", errorCount);
            stats.put("warningCount", warningCount);
            stats.put("throughputPerSecond", throughputPerSecond);
            stats.put("throughputPerMinute", throughputPerMinute);
            stats.put("totalSizeFormatted", totalSizeFormatted);
            stats.put("lastMessageAt", lastMessage.map(KafkaMessage::getTimestamp).orElse(null));
            stats.put("isMonitored", topic.isMonitored());
            stats.put("consumerActive", false); // À implémenter selon ta logique

            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error fetching live stats for topic {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch live stats"));
        }
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN TOPICS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/topics/orphans
     * Récupère la liste des topics orphelins (sans connexion active)
     */
    @GetMapping("/orphans")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getOrphanTopics() {
        List<TopicResponse> orphans = topicService.getOrphanTopics();
        String message = orphans.isEmpty()
                ? "No orphan topics found"
                : String.format("Found %d orphan topic(s)", orphans.size());
        return ResponseEntity.ok(ApiResponse.success(message, orphans));
    }

    /**
     * GET /api/topics/orphans/count
     * Compte le nombre de topics orphelins
     */
    @GetMapping("/orphans/count")
    public ResponseEntity<ApiResponse<Long>> countOrphanTopics() {
        long count = topicService.countOrphanTopics();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * DELETE /api/topics/orphans
     * Supprime les topics orphelins sélectionnés
     * Body: { "ids": [1, 2, 3] }
     */
    @DeleteMapping("/orphans")
    public ResponseEntity<ApiResponse<OrphanDeleteResponse>> deleteOrphanTopics(
            @RequestBody OrphanDeleteRequest request) {
        var result = topicService.deleteOrphanTopics(request.ids());
        return ResponseEntity.ok(ApiResponse.success(
                result.message(),
                new OrphanDeleteResponse(result.deleted(), result.skipped())
        ));
    }

    /**
     * DELETE /api/topics/orphans/all
     * Supprime TOUS les topics orphelins
     */
    @DeleteMapping("/orphans/all")
    public ResponseEntity<ApiResponse<OrphanDeleteResponse>> deleteAllOrphanTopics() {
        var result = topicService.deleteAllOrphanTopics();
        return ResponseEntity.ok(ApiResponse.success(
                result.message(),
                new OrphanDeleteResponse(result.deleted(), result.skipped())
        ));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DTOs pour les orphelins
    // ═══════════════════════════════════════════════════════════════════════

    public record OrphanDeleteRequest(List<Long> ids) {}

    public record OrphanDeleteResponse(int deleted, int skipped) {}
}
