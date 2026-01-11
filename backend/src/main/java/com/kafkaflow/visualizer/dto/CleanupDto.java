package com.kafkaflow.visualizer.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs pour le service de nettoyage (Cleanup)
 * Gère les topics et connexions orphelins
 */
public class CleanupDto {

    // ═══════════════════════════════════════════════════════════════════════
    // RESPONSE - Vue d'ensemble du cleanup
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Réponse complète avec tous les éléments orphelins détectés
     */
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

    /**
     * Représentation d'une connexion orpheline
     */
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

    /**
     * Représentation d'un topic orphelin
     */
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

    /**
     * Request pour supprimer des éléments sélectionnés
     */
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

    /**
     * Résultat d'une opération de suppression
     */
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