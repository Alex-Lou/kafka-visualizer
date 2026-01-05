package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.service.KafkaTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class KafkaTopicController {

    private final KafkaTopicService topicService;
    private final com.kafkaflow.visualizer.service.KafkaConnectionService connectionService;

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
}
