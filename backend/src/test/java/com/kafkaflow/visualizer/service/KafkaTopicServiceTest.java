package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KafkaTopicServiceTest {

    @Mock
    private KafkaTopicRepository topicRepository;

    @Mock
    private KafkaConnectionRepository connectionRepository;

    @Mock
    private KafkaMessageRepository messageRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private KafkaTopicService kafkaTopicService;

    private KafkaTopic kafkaTopic;
    private KafkaConnection kafkaConnection;

    @BeforeEach
    void setUp() {
        kafkaConnection = new KafkaConnection();
        kafkaConnection.setId(1L);
        kafkaConnection.setName("Test Connection");

        kafkaTopic = new KafkaTopic();
        kafkaTopic.setId(1L);
        kafkaTopic.setName("test-topic");
        kafkaTopic.setConnection(kafkaConnection);
    }

    @Test
    void testGetTopicsByConnection() {
        // Given
        when(topicRepository.findByConnectionId(anyLong())).thenReturn(Collections.singletonList(kafkaTopic));

        // When
        List<KafkaDto.TopicResponse> topics = kafkaTopicService.getTopicsByConnection(1L);

        // Then
        assertEquals(1, topics.size());
        assertEquals("test-topic", topics.get(0).getName());
    }

    @Test
    void testGetTopic() {
        // Given
        when(topicRepository.findById(anyLong())).thenReturn(Optional.of(kafkaTopic));

        // When
        KafkaDto.TopicResponse topic = kafkaTopicService.getTopic(1L);

        // Then
        assertEquals("test-topic", topic.getName());
    }

    @Test
    void testGetMessages() {
        // Given
        KafkaDto.MessageFilter filter = new KafkaDto.MessageFilter();
        filter.setTopicId(1L);
        filter.setPage(0);
        filter.setSize(10);

        PageRequest pageRequest = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(Sort.Direction.DESC, "timestamp"));
        KafkaMessage kafkaMessage = new KafkaMessage();
        kafkaMessage.setTopic(kafkaTopic);
        Page<KafkaMessage> messages = new PageImpl<>(Collections.singletonList(kafkaMessage));

        when(messageRepository.findByFilters(
                filter.getTopicId(),
                filter.getKey(),
                filter.getValueContains(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getDirection(),
                filter.getStatus(),
                filter.getPartition(),
                pageRequest
        )).thenReturn(messages);

        // When
        Page<KafkaDto.MessageResponse> result = kafkaTopicService.getMessages(filter);

        // Then
        assertEquals(1, result.getTotalElements());
    }
}
