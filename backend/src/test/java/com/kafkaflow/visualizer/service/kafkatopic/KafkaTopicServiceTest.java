package com.kafkaflow.visualizer.service.kafkatopic;

import com.kafkaflow.visualizer.dto.KafkaDto.TopicResponse;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
    private KafkaConnectionService connectionService;

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
    void getTopicsByConnection_ShouldReturnList() {
        // Given
        when(topicRepository.findByConnectionId(anyLong())).thenReturn(Collections.singletonList(kafkaTopic));

        // When
        List<TopicResponse> topics = kafkaTopicService.getTopicsByConnection(1L);

        // Then
        assertEquals(1, topics.size());
        assertEquals("test-topic", topics.get(0).getName());
    }

    @Test
    void getTopic_ShouldReturnTopic() {
        // Given
        when(topicRepository.findById(anyLong())).thenReturn(Optional.of(kafkaTopic));

        // When
        TopicResponse topic = kafkaTopicService.getTopic(1L);

        // Then
        assertEquals("test-topic", topic.getName());
    }
}