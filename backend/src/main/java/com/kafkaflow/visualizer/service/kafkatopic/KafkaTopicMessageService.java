package com.kafkaflow.visualizer.service.kafkatopic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageFilter;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaTopic;
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
public class KafkaTopicMessageService {

    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;
    private final ObjectMapper objectMapper;

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
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

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