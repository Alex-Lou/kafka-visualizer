package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.HealthStatus;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class HealthServiceTest {

    @Mock
    private KafkaConnectionRepository connectionRepository;
    @Mock
    private KafkaTopicRepository topicRepository;
    @Mock
    private KafkaMessageRepository messageRepository;
    @Mock
    private KafkaConsumerManager consumerManager;

    @InjectMocks
    private HealthService healthService;

    @Test
    void getHealthStatus_ShouldReturnUp_WhenAllComponentsAreHealthy() {
        // Given
        // Database
        given(connectionRepository.count()).willReturn(1L);
        given(topicRepository.count()).willReturn(5L);
        given(messageRepository.count()).willReturn(100L);

        // Kafka
        given(connectionRepository.countActiveConnections()).willReturn(1);
        given(connectionRepository.findAllOrdered()).willReturn(Collections.emptyList());

        // Consumers
        given(consumerManager.getActiveConsumerCount()).willReturn(2);
        given(topicRepository.countMonitoredTopics()).willReturn(2);
        given(consumerManager.getConsumerStatus()).willReturn(Collections.emptyMap());

        // Metrics
        given(messageRepository.countMessagesSince(any(LocalDateTime.class))).willReturn(10L);

        // When
        HealthStatus status = healthService.getHealthStatus();

        // Then
        assertThat(status.getStatus()).isEqualTo("UP");
        assertThat(status.getDatabase().getStatus()).isEqualTo("UP");
        assertThat(status.getKafka().getStatus()).isEqualTo("UP");
        assertThat(status.getConsumers().getStatus()).isEqualTo("UP");
    }

    @Test
    void getHealthStatus_ShouldReturnDegraded_WhenConsumersAreLagging() {
        // Given
        // Database OK
        given(connectionRepository.count()).willReturn(1L);
        
        // Kafka OK
        given(connectionRepository.countActiveConnections()).willReturn(1);
        given(connectionRepository.findAllOrdered()).willReturn(Collections.emptyList());

        // Consumers Degraded (2 monitored, but only 1 active)
        given(topicRepository.countMonitoredTopics()).willReturn(2);
        given(consumerManager.getActiveConsumerCount()).willReturn(1);
        given(consumerManager.getConsumerStatus()).willReturn(Collections.emptyMap());

        // When
        HealthStatus status = healthService.getHealthStatus();

        // Then
        assertThat(status.getStatus()).isEqualTo("DEGRADED");
        assertThat(status.getConsumers().getStatus()).isEqualTo("DEGRADED");
    }

    @Test
    void getHealthStatus_ShouldReturnDown_WhenDatabaseFails() {
        // Given
        given(connectionRepository.count()).willThrow(new RuntimeException("DB Error"));

        // When
        HealthStatus status = healthService.getHealthStatus();

        // Then
        assertThat(status.getStatus()).isEqualTo("DOWN");
        assertThat(status.getDatabase().getStatus()).isEqualTo("DOWN");
    }
}
