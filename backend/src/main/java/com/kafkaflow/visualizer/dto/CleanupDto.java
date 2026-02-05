package com.kafkaflow.visualizer.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class CleanupDto {

    // ═══════════════════════════════════════════════════════════════════════
    // RESPONSE - Vue d'ensemble du cleanup
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CleanupOverviewResponse {
        private List<OrphanConnectionResponse> orphanConnections;
        private List<OrphanTopicResponse> orphanTopics;
        private int totalOrphanConnections;
        private int totalOrphanTopics;
        private String message;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN CONNECTION
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrphanConnectionResponse {
        private Long id;
        private String name;
        private String bootstrapServers;
        private String description;
        private String status;
        private int topicCount;
        private LocalDateTime createdAt;
        private LocalDateTime lastConnectedAt;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN TOPIC
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrphanTopicResponse {
        private Long id;
        private String name;
        private Long connectionId;
        private String connectionName;
        private String connectionStatus;
        private Long messageCount;
        private boolean monitored;
        private LocalDateTime lastMessageAt;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REQUESTS
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CleanupDeleteRequest {
        private List<Long> connectionIds;
        private List<Long> topicIds;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CleanupDeleteResponse {
        private int connectionsDeleted;
        private int topicsDeleted;
        private int connectionsSkipped;
        private int topicsSkipped;
        private String message;
    }
}