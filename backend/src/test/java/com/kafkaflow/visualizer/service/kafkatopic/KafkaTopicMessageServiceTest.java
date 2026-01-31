package com.kafkaflow.visualizer.service.kafkatopic;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageFilter;
import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaTopic;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KafkaTopicMessageServiceTest {

    @Mock
    private KafkaTopicRepository topicRepository;

    @Mock
    private KafkaMessageRepository messageRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private KafkaTopicMessageService messageService;

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
    void getMessages_ShouldReturnPage() {
        // Given
        MessageFilter filter = MessageFilter.builder()
                .topicId(1L)
                .page(0)
                .size(10)
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp"));

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
        Page<MessageResponse> result = messageService.getMessages(filter);

        // Then
        assertEquals(1, result.getTotalElements());
    }
}