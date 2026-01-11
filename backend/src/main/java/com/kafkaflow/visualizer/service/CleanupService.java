package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.CleanupDto.*;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service de nettoyage - Gère la détection et suppression des éléments orphelins
 *
 * Éléments orphelins:
 * - Connexions: status != CONNECTED (ERROR, DISCONNECTED, CONNECTING)
 * - Topics: liés à une connexion orpheline ou sans connexion
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupService {

    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;

    // ═══════════════════════════════════════════════════════════════════════
    // DETECTION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Récupère une vue d'ensemble de tous les éléments orphelins
     */
    @Transactional(readOnly = true)
    public CleanupOverviewResponse getCleanupOverview() {
        List<OrphanConnectionResponse> orphanConnections = getOrphanConnections();
        List<OrphanTopicResponse> orphanTopics = getOrphanTopics();

        String message = buildOverviewMessage(orphanConnections.size(), orphanTopics.size());

        return CleanupOverviewResponse.builder()
                .orphanConnections(orphanConnections)
                .orphanTopics(orphanTopics)
                .totalOrphanConnections(orphanConnections.size())
                .totalOrphanTopics(orphanTopics.size())
                .message(message)
                .build();
    }

    /**
     * Récupère toutes les connexions orphelines
     */
    @Transactional(readOnly = true)
    public List<OrphanConnectionResponse> getOrphanConnections() {
        return connectionRepository.findOrphanConnections().stream()
                .map(this::toOrphanConnectionResponse)
                .toList();
    }

    /**
     * Récupère tous les topics orphelins
     */
    @Transactional(readOnly = true)
    public List<OrphanTopicResponse> getOrphanTopics() {
        return topicRepository.findOrphanTopics().stream()
                .map(this::toOrphanTopicResponse)
                .toList();
    }

    /**
     * Compte le nombre total d'éléments orphelins
     */
    @Transactional(readOnly = true)
    public long countAllOrphans() {
        return connectionRepository.countOrphanConnections() + topicRepository.countOrphanTopics();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SUPPRESSION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Supprime les éléments orphelins sélectionnés
     */
    @Transactional
    public CleanupDeleteResponse deleteSelected(CleanupDeleteRequest request) {
        int connectionsDeleted = 0;
        int topicsDeleted = 0;
        int connectionsSkipped = 0;
        int topicsSkipped = 0;

        // Supprimer les connexions sélectionnées
        if (request.getConnectionIds() != null && !request.getConnectionIds().isEmpty()) {
            var result = deleteOrphanConnections(request.getConnectionIds());
            connectionsDeleted = result.deleted;
            connectionsSkipped = result.skipped;
        }

        // Supprimer les topics sélectionnés
        if (request.getTopicIds() != null && !request.getTopicIds().isEmpty()) {
            var result = deleteOrphanTopics(request.getTopicIds());
            topicsDeleted = result.deleted;
            topicsSkipped = result.skipped;
        }

        String message = buildDeleteMessage(connectionsDeleted, topicsDeleted, connectionsSkipped, topicsSkipped);

        log.info("Cleanup completed: {} connections deleted, {} topics deleted",
                connectionsDeleted, topicsDeleted);

        return CleanupDeleteResponse.builder()
                .connectionsDeleted(connectionsDeleted)
                .topicsDeleted(topicsDeleted)
                .connectionsSkipped(connectionsSkipped)
                .topicsSkipped(topicsSkipped)
                .message(message)
                .build();
    }

    /**
     * Supprime TOUS les éléments orphelins
     */
    @Transactional
    public CleanupDeleteResponse deleteAll() {
        // Récupérer tous les orphelins
        List<KafkaConnection> orphanConnections = connectionRepository.findOrphanConnections();
        List<KafkaTopic> orphanTopics = topicRepository.findOrphanTopics();

        int topicsDeleted = 0;
        int connectionsDeleted = 0;

        // Supprimer d'abord les topics orphelins (et leurs messages)
        for (KafkaTopic topic : orphanTopics) {
            messageRepository.deleteByTopicId(topic.getId());
            topicRepository.delete(topic);
            topicsDeleted++;
        }

        // Supprimer les connexions orphelines (et leurs topics/messages restants)
        for (KafkaConnection connection : orphanConnections) {
            deleteConnectionCascade(connection);
            connectionsDeleted++;
        }

        String message = buildDeleteMessage(connectionsDeleted, topicsDeleted, 0, 0);

        log.info("Full cleanup completed: {} connections deleted, {} topics deleted",
                connectionsDeleted, topicsDeleted);

        return CleanupDeleteResponse.builder()
                .connectionsDeleted(connectionsDeleted)
                .topicsDeleted(topicsDeleted)
                .connectionsSkipped(0)
                .topicsSkipped(0)
                .message(message)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS - Suppression
    // ═══════════════════════════════════════════════════════════════════════

    private record DeleteResult(int deleted, int skipped) {}

    /**
     * Supprime les connexions orphelines par IDs
     */
    private DeleteResult deleteOrphanConnections(List<Long> ids) {
        // Vérifier que les IDs sont bien des orphelins
        List<KafkaConnection> toDelete = connectionRepository.findOrphanConnectionsByIds(ids);

        int deleted = 0;
        for (KafkaConnection connection : toDelete) {
            deleteConnectionCascade(connection);
            deleted++;
        }

        int skipped = ids.size() - deleted;
        return new DeleteResult(deleted, skipped);
    }

    /**
     * Supprime les topics orphelins par IDs
     */
    private DeleteResult deleteOrphanTopics(List<Long> ids) {
        // Vérifier que les IDs sont bien des orphelins
        List<KafkaTopic> toDelete = topicRepository.findOrphanTopicsByIds(ids);

        int deleted = 0;
        for (KafkaTopic topic : toDelete) {
            messageRepository.deleteByTopicId(topic.getId());
            topicRepository.delete(topic);
            deleted++;
        }

        int skipped = ids.size() - deleted;
        return new DeleteResult(deleted, skipped);
    }

    /**
     * Supprime une connexion et toutes ses données associées
     */
    private void deleteConnectionCascade(KafkaConnection connection) {
        // Supprimer tous les topics de cette connexion (et leurs messages)
        List<KafkaTopic> topics = topicRepository.findByConnectionId(connection.getId());
        for (KafkaTopic topic : topics) {
            messageRepository.deleteByTopicId(topic.getId());
            topicRepository.delete(topic);
        }
        // Supprimer la connexion
        connectionRepository.delete(connection);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS - Mapping
    // ═══════════════════════════════════════════════════════════════════════

    private OrphanConnectionResponse toOrphanConnectionResponse(KafkaConnection connection) {
        int topicCount = (int) topicRepository.countByConnectionId(connection.getId());

        return OrphanConnectionResponse.builder()
                .id(connection.getId())
                .name(connection.getName())
                .bootstrapServers(connection.getBootstrapServers())
                .description(connection.getDescription())
                .status(connection.getStatus().name())
                .topicCount(topicCount)
                .createdAt(connection.getCreatedAt())
                .lastConnectedAt(connection.getLastConnectedAt())
                .build();
    }

    private OrphanTopicResponse toOrphanTopicResponse(KafkaTopic topic) {
        String connectionName = "No connection";
        String connectionStatus = "DELETED";
        Long connectionId = null;

        if (topic.getConnection() != null) {
            connectionName = topic.getConnection().getName();
            connectionStatus = topic.getConnection().getStatus().name();
            connectionId = topic.getConnection().getId();
        }

        return OrphanTopicResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .connectionId(connectionId)
                .connectionName(connectionName)
                .connectionStatus(connectionStatus)
                .messageCount(topic.getMessageCount())
                .monitored(topic.isMonitored())
                .lastMessageAt(topic.getLastMessageAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS - Messages
    // ═══════════════════════════════════════════════════════════════════════

    private String buildOverviewMessage(int connections, int topics) {
        if (connections == 0 && topics == 0) {
            return "No orphan elements found. Your system is clean!";
        }

        List<String> parts = new ArrayList<>();
        if (connections > 0) {
            parts.add(connections + " orphan connection" + (connections > 1 ? "s" : ""));
        }
        if (topics > 0) {
            parts.add(topics + " orphan topic" + (topics > 1 ? "s" : ""));
        }

        return "Found " + String.join(" and ", parts);
    }

    private String buildDeleteMessage(int connDeleted, int topicsDeleted, int connSkipped, int topicsSkipped) {
        if (connDeleted == 0 && topicsDeleted == 0) {
            return "No elements were deleted";
        }

        List<String> parts = new ArrayList<>();
        if (connDeleted > 0) {
            parts.add(connDeleted + " connection" + (connDeleted > 1 ? "s" : ""));
        }
        if (topicsDeleted > 0) {
            parts.add(topicsDeleted + " topic" + (topicsDeleted > 1 ? "s" : ""));
        }

        String message = "Successfully deleted " + String.join(" and ", parts);

        int totalSkipped = connSkipped + topicsSkipped;
        if (totalSkipped > 0) {
            message += " (" + totalSkipped + " skipped - not orphans)";
        }

        return message;
    }
}