package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.TopicResponse;
import com.kafkaflow.visualizer.dto.KafkaDto.TopicUpdateRequest;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

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
    private KafkaTopicService topicService;

    @Test
    void getTopicsByConnection_ShouldReturnTopics() {
        // Given
        Long connectionId = 1L;
        KafkaConnection connection = KafkaConnection.builder().id(connectionId).name("Test Conn").build();
        KafkaTopic topic = KafkaTopic.builder().id(10L).name("topic-1").connection(connection).build();

        given(topicRepository.findByConnectionId(connectionId)).willReturn(List.of(topic));

        // When
        List<TopicResponse> result = topicService.getTopicsByConnection(connectionId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("topic-1");
    }

    @Test
    void createOrUpdateTopic_ShouldCreateNew_WhenNotExists() {
        // Given
        Long connectionId = 1L;
        String topicName = "new-topic";
        KafkaConnection connection = KafkaConnection.builder().id(connectionId).build();

        given(connectionRepository.findById(connectionId)).willReturn(Optional.of(connection));
        given(topicRepository.findByConnectionIdAndName(connectionId, topicName)).willReturn(Optional.empty());
        given(topicRepository.save(any(KafkaTopic.class))).willAnswer(inv -> {
            KafkaTopic t = inv.getArgument(0);
            t.setId(100L);
            return t;
        });

        // When
        TopicResponse response = topicService.createOrUpdateTopic(connectionId, topicName, 3, (short) 1);

        // Then
        assertThat(response.getName()).isEqualTo(topicName);
        assertThat(response.getPartitions()).isEqualTo(3);
        then(topicRepository).should().save(any(KafkaTopic.class));
    }

    @Test
    void updateTopic_ShouldUpdateMetadata() {
        // Given
        Long topicId = 1L;
        KafkaConnection connection = KafkaConnection.builder().id(1L).name("Conn").build();
        KafkaTopic existingTopic = KafkaTopic.builder()
                .id(topicId)
                .name("my-topic")
                .connection(connection)
                .description("Old Desc")
                .build();

        TopicUpdateRequest request = TopicUpdateRequest.builder()
                .description("New Desc")
                .monitored(true)
                .build();

        given(topicRepository.findById(topicId)).willReturn(Optional.of(existingTopic));
        given(topicRepository.save(any(KafkaTopic.class))).willAnswer(inv -> inv.getArgument(0));

        // When
        TopicResponse response = topicService.updateTopic(topicId, request);

        // Then
        assertThat(response.getDescription()).isEqualTo("New Desc");
        assertThat(response.isMonitored()).isTrue();
    }

    @Test
    void deleteTopic_ShouldCallRepository() {
        // Given
        Long topicId = 1L;

        // When
        topicService.deleteTopic(topicId);

        // Then
        then(topicRepository).should().deleteById(topicId);
    }
}
