package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import com.kafkaflow.visualizer.service.kafkatopic.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class KafkaTopicController {

    private final KafkaTopicService topicService;
    private final KafkaTopicMessageService messageService;
    private final KafkaTopicStatsService statsService;
    private final KafkaOrphanTopicService orphanService;
    private final KafkaConnectionService connectionService;

    // ═══════════════════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/connection/{connectionId}")
    public ApiResponse<List<TopicResponse>> getTopicsByConnection(@PathVariable Long connectionId) {
        return ApiResponse.success(topicService.getTopicsByConnection(connectionId));
    }

    @GetMapping("/{id}")
    public ApiResponse<TopicResponse> getTopic(@PathVariable Long id) {
        return ApiResponse.success(topicService.getTopic(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<TopicResponse> updateTopic(@PathVariable Long id,
                                                  @Valid @RequestBody TopicUpdateRequest request) {
        return ApiResponse.success("Topic updated successfully", topicService.updateTopic(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ApiResponse.success("Topic deleted successfully", null);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KAFKA OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    @PostMapping("/connection/{connectionId}/sync")
    public ApiResponse<List<TopicResponse>> syncTopics(@PathVariable Long connectionId) {
        List<String> topicNames = connectionService.discoverTopics(connectionId);
        return ApiResponse.success("Topics synchronized successfully",
                topicService.syncTopics(connectionId, topicNames));
    }

    @PostMapping("/connection/{connectionId}/create")
    public ApiResponse<TopicResponse> createTopicInKafka(@PathVariable Long connectionId,
                                                         @Valid @RequestBody TopicCreateRequest request) {
        return ApiResponse.success("Topic created successfully",
                topicService.createTopicInKafka(connectionId, request));
    }

    @DeleteMapping("/{id}/kafka")
    public ApiResponse<Void> deleteTopicFromKafka(@PathVariable Long id) {
        topicService.deleteTopicFromKafka(id);
        return ApiResponse.success("Topic deleted from Kafka", null);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MESSAGES
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/{topicId}/messages")
    public ApiResponse<Page<MessageResponse>> getMessages(@PathVariable Long topicId,
                                                          @Valid MessageFilter filter) {
        filter.setTopicId(topicId);
        return ApiResponse.success(messageService.getMessages(filter));
    }

    @GetMapping("/{topicId}/messages/recent")
    public ApiResponse<List<MessageResponse>> getRecentMessages(@PathVariable Long topicId) {
        return ApiResponse.success(messageService.getRecentMessages(topicId));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/live-stats")
    public ApiResponse<TopicLiveStatsResponse> getLiveStats(@PathVariable Long id) {
        return ApiResponse.success(statsService.getLiveStats(id));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHANS
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/orphans")
    public ApiResponse<List<TopicResponse>> getOrphanTopics() {
        return ApiResponse.success(orphanService.getOrphanTopics());
    }

    @GetMapping("/orphans/count")
    public ApiResponse<Long> countOrphanTopics() {
        return ApiResponse.success(orphanService.countOrphanTopics());
    }

    @DeleteMapping("/orphans")
    public ApiResponse<OrphanDeleteResponse> deleteOrphanTopics(@RequestBody OrphanDeleteRequest request) {
        var result = orphanService.deleteOrphanTopics(request.ids());
        return ApiResponse.success(toResponse(result));
    }

    @DeleteMapping("/orphans/all")
    public ApiResponse<OrphanDeleteResponse> deleteAllOrphanTopics() {
        var result = orphanService.deleteAllOrphanTopics();
        return ApiResponse.success(toResponse(result));
    }

    private OrphanDeleteResponse toResponse(KafkaOrphanTopicService.OrphanDeleteResult result) {
        return OrphanDeleteResponse.builder()
                .deleted(result.deleted())
                .skipped(result.skipped())
                .message(result.message())
                .build();
    }
}