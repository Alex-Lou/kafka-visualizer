package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaTopicService {

    private final KafkaTopicRepository topicRepository;
    private final KafkaConnectionRepository connectionRepository;
    private final KafkaMessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsByConnection(Long connectionId) {
        return topicRepository.findByConnectionId(connectionId).stream()
                .map(this::toTopicResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TopicResponse getTopic(Long id) {
        return topicRepository.findById(id)
                .map(this::toTopicResponse)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + id));
    }

    @Transactional
    public TopicResponse createOrUpdateTopic(Long connectionId, String topicName, Integer partitions, Short replicationFactor) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found: " + connectionId));

        KafkaTopic topic = topicRepository.findByConnectionIdAndName(connectionId, topicName)
                .orElseGet(() -> KafkaTopic.builder()
                        .name(topicName)
                        .connection(connection)
                        .monitored(false)
                        .messageCount(0L)
                        .build());

        topic.setPartitions(partitions);
        topic.setReplicationFactor(replicationFactor);

        return toTopicResponse(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponse updateTopic(Long id, TopicUpdateRequest request) {
        KafkaTopic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + id));

        if (request.getDescription() != null) {
            topic.setDescription(request.getDescription());
        }
        if (request.getColor() != null) {
            topic.setColor(request.getColor());
        }
        topic.setMonitored(request.isMonitored());

        return toTopicResponse(topicRepository.save(topic));
    }

    @Transactional
    public void deleteTopic(Long id) {
        topicRepository.deleteById(id);
    }

    @Transactional
    public List<TopicResponse> syncTopics(Long connectionId, List<String> discoveredTopics) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found: " + connectionId));

        for (String topicName : discoveredTopics) {
            if (!topicRepository.existsByConnectionIdAndName(connectionId, topicName)) {
                KafkaTopic topic = KafkaTopic.builder()
                        .name(topicName)
                        .connection(connection)
                        .monitored(false)
                        .messageCount(0L)
                        .build();
                topicRepository.save(topic);
            }
        }

        return getTopicsByConnection(connectionId);
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(MessageFilter filter) {
        PageRequest pageRequest = PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.by(Sort.Direction.DESC, "timestamp")
        );

        Page<KafkaMessage> messages = messageRepository.findByFilters(
                filter.getTopicId(),
                filter.getKey(),
                filter.getValueContains(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getDirection(),
                filter.getStatus(),
                filter.getPartition(),
                pageRequest
        );

        return messages.map(this::toMessageResponse);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getRecentMessages(Long topicId) {
        return messageRepository.findTop100ByTopicIdOrderByTimestampDesc(topicId).stream()
                .map(this::toMessageResponse)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesForReport(List<Long> topicIds) {
        return topicIds.stream()
                .flatMap(topicId -> messageRepository.findTop100ByTopicIdOrderByTimestampDesc(topicId).stream())
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse saveMessage(Long topicId, KafkaMessage.MessageDirection direction,
                                        String key, String value, Integer partition, Long offset,
                                        Map<String, String> headers) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        String headersJson = null;
        if (headers != null && !headers.isEmpty()) {
            try {
                headersJson = objectMapper.writeValueAsString(headers);
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize headers", e);
            }
        }

        KafkaMessage message = KafkaMessage.builder()
                .topic(topic)
                .direction(direction)
                .key(key)
                .value(value)
                .partition(partition)
                .offset(offset)
                .headers(headersJson)
                .status(KafkaMessage.MessageStatus.RECEIVED)
                .timestamp(LocalDateTime.now())
                .build();

        topic.setMessageCount(topic.getMessageCount() + 1);
        topic.setLastMessageAt(LocalDateTime.now());
        topicRepository.save(topic);

        return toMessageResponse(messageRepository.save(message));
    }

    private TopicResponse toTopicResponse(KafkaTopic topic) {
        return TopicResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .connectionId(topic.getConnection().getId())
                .connectionName(topic.getConnection().getName())
                .partitions(topic.getPartitions())
                .replicationFactor(topic.getReplicationFactor())
                .description(topic.getDescription())
                .color(topic.getColor())
                .monitored(topic.isMonitored())
                .messageCount(topic.getMessageCount())
                .lastMessageAt(topic.getLastMessageAt())
                .build();
    }

    private MessageResponse toMessageResponse(KafkaMessage message) {
        Map<String, String> headers = null;
        if (message.getHeaders() != null) {
            try {
                headers = objectMapper.readValue(message.getHeaders(), new TypeReference<>() {});
            } catch (JsonProcessingException e) {
                log.warn("Failed to deserialize headers", e);
            }
        }

        return MessageResponse.builder()
                .id(message.getId())
                .topicName(message.getTopic().getName())
                .key(message.getKey())
                .value(message.getValue())
                .partition(message.getPartition())
                .offset(message.getOffset())
                .timestamp(message.getTimestamp())
                .headers(headers)
                .direction(message.getDirection())
                .status(message.getStatus())
                .sourceApplication(message.getSourceApplication())
                .targetApplication(message.getTargetApplication())
                .build();
    }


    // ============================================================

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN TOPICS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Récupère tous les topics orphelins (sans connexion active)
     */
    @Transactional(readOnly = true)
    public List<TopicResponse> getOrphanTopics() {
        return topicRepository.findOrphanTopics().stream()
                .map(this::toOrphanTopicResponse)
                .toList();
    }

    /**
     * Compte le nombre de topics orphelins
     */
    @Transactional(readOnly = true)
    public long countOrphanTopics() {
        return topicRepository.countOrphanTopics();
    }

    /**
     * Supprime les topics orphelins sélectionnés par leurs IDs
     * Vérifie que les topics sont bien orphelins avant suppression
     *
     * @param ids Liste des IDs de topics à supprimer
     * @return Résultat avec le nombre de topics supprimés
     */
    @Transactional
    public OrphanDeleteResult deleteOrphanTopics(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new OrphanDeleteResult(0, 0, "No topics specified");
        }

        // Récupérer uniquement les topics qui sont vraiment orphelins parmi les IDs demandés
        List<KafkaTopic> orphansToDelete = topicRepository.findOrphanTopicsByIds(ids);

        int requested = ids.size();
        int deleted = orphansToDelete.size();
        int skipped = requested - deleted;

        if (!orphansToDelete.isEmpty()) {
            // Supprimer les messages associés d'abord (si cascade pas configurée)
            for (KafkaTopic topic : orphansToDelete) {
                messageRepository.deleteByTopicId(topic.getId());
            }
            // Supprimer les topics
            topicRepository.deleteAll(orphansToDelete);

            log.info("Deleted {} orphan topics (skipped {} non-orphan)", deleted, skipped);
        }

        String message = deleted > 0
                ? String.format("Successfully deleted %d orphan topic(s)", deleted)
                : "No orphan topics were deleted";

        if (skipped > 0) {
            message += String.format(" (%d skipped - not orphans)", skipped);
        }

        return new OrphanDeleteResult(deleted, skipped, message);
    }

    /**
     * Supprime TOUS les topics orphelins
     *
     * @return Résultat avec le nombre de topics supprimés
     */
    @Transactional
    public OrphanDeleteResult deleteAllOrphanTopics() {
        List<KafkaTopic> orphans = topicRepository.findOrphanTopics();

        if (orphans.isEmpty()) {
            return new OrphanDeleteResult(0, 0, "No orphan topics found");
        }

        int deleted = orphans.size();

        // Supprimer les messages associés d'abord
        for (KafkaTopic topic : orphans) {
            messageRepository.deleteByTopicId(topic.getId());
        }
        // Supprimer les topics
        topicRepository.deleteAll(orphans);

        log.info("Deleted all {} orphan topics", deleted);

        return new OrphanDeleteResult(deleted, 0,
                String.format("Successfully deleted %d orphan topic(s)", deleted));
    }

    /**
     * Convertit un topic orphelin en response avec info sur la connexion
     */
    private TopicResponse toOrphanTopicResponse(KafkaTopic topic) {
        String connectionName = "No connection";
        String connectionStatus = "DELETED";
        Long connectionId = null;

        if (topic.getConnection() != null) {
            connectionName = topic.getConnection().getName();
            connectionStatus = topic.getConnection().getStatus().name();
            connectionId = topic.getConnection().getId();
        }

        return TopicResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .connectionId(connectionId)
                .connectionName(connectionName)
                .connectionStatus(connectionStatus)  // ← Nouveau champ
                .partitions(topic.getPartitions())
                .replicationFactor(topic.getReplicationFactor())
                .description(topic.getDescription())
                .color(topic.getColor())
                .monitored(topic.isMonitored())
                .messageCount(topic.getMessageCount())
                .lastMessageAt(topic.getLastMessageAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INNER CLASSES / RECORDS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Résultat d'une opération de suppression d'orphelins
     */
    public record OrphanDeleteResult(
            int deleted,
            int skipped,
            String message
    ) {}
}
