package com.kafkaflow.visualizer.service.kafkatopic;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.exception.KafkaConnectionException;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaTopicService {

    private final KafkaTopicRepository topicRepository;
    private final KafkaConnectionRepository connectionRepository;
    private final KafkaMessageRepository messageRepository;
    private final KafkaConnectionService connectionService;

    // ═══════════════════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════════════════

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
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));
    }

    @Transactional
    public TopicResponse updateTopic(Long id, TopicUpdateRequest request) {
        KafkaTopic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));

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

    // ═══════════════════════════════════════════════════════════════════════
    // SYNC
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public List<TopicResponse> syncTopics(Long connectionId, List<String> discoveredTopics) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", connectionId));

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

    // ═══════════════════════════════════════════════════════════════════════
    // KAFKA OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public TopicResponse createTopicInKafka(Long connectionId, TopicCreateRequest request) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", connectionId));

        if (topicRepository.existsByConnectionIdAndName(connectionId, request.getName())) {
            throw new IllegalStateException("Topic already exists in database: " + request.getName());
        }

        try {
            AdminClient adminClient = connectionService.getOrCreateAdminClient(connection);

            NewTopic newTopic = new NewTopic(
                    request.getName(),
                    request.getPartitions(),
                    request.getReplicationFactor()
            );

            if (request.getConfigs() != null && !request.getConfigs().isEmpty()) {
                newTopic.configs(request.getConfigs());
            }

            CreateTopicsResult result = adminClient.createTopics(Collections.singleton(newTopic));
            result.all().get(15, TimeUnit.SECONDS);

            log.info("Successfully created topic in Kafka: {}", request.getName());

            KafkaTopic topic = KafkaTopic.builder()
                    .name(request.getName())
                    .connection(connection)
                    .partitions(request.getPartitions())
                    .replicationFactor(request.getReplicationFactor())
                    .description(request.getDescription())
                    .color(request.getColor())
                    .monitored(request.isMonitored())
                    .messageCount(0L)
                    .build();

            return toTopicResponse(topicRepository.save(topic));

        } catch (Exception e) {
            log.error("Failed to create topic in Kafka: {}", request.getName(), e);
            throw new KafkaConnectionException("Failed to create topic in Kafka: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteTopicFromKafka(Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        KafkaConnection connection = topic.getConnection();

        try {
            AdminClient adminClient = connectionService.getOrCreateAdminClient(connection);

            DeleteTopicsResult result = adminClient.deleteTopics(Collections.singleton(topic.getName()));
            result.all().get(15, TimeUnit.SECONDS);

            log.info("Successfully deleted topic from Kafka: {}", topic.getName());

            messageRepository.deleteByTopicId(topicId);
            topicRepository.delete(topic);

            log.info("Topic deleted from database: {}", topic.getName());

        } catch (Exception e) {
            log.error("Failed to delete topic from Kafka: {}", topic.getName(), e);
            throw new KafkaConnectionException("Failed to delete topic from Kafka: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MAPPER
    // ═══════════════════════════════════════════════════════════════════════

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
}