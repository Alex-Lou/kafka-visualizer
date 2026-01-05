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
}
