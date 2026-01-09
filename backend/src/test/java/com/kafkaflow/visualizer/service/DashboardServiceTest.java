package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.DashboardStats;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private KafkaConnectionRepository connectionRepository;
    @Mock
    private KafkaTopicRepository topicRepository;
    @Mock
    private KafkaMessageRepository messageRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getDashboardStats_ShouldAggregateData() {
        // Given
        given(connectionRepository.count()).willReturn(5L);
        given(connectionRepository.countActiveConnections()).willReturn(2);
        
        given(topicRepository.count()).willReturn(10L);
        given(topicRepository.countMonitoredTopics()).willReturn(4);
        
        KafkaTopic topTopic = KafkaTopic.builder().name("hot-topic").messageCount(100L).build();
        given(topicRepository.findTopByMessageCount(anyInt())).willReturn(List.of(topTopic));

        given(messageRepository.count()).willReturn(5000L);
        given(messageRepository.countMessagesSince(any(LocalDateTime.class))).willReturn(1000L);
        given(messageRepository.getMessageTrendsByHour(any(LocalDateTime.class))).willReturn(Collections.emptyList());

        // When
        DashboardStats stats = dashboardService.getDashboardStats();

        // Then
        assertThat(stats.getTotalConnections()).isEqualTo(5);
        assertThat(stats.getActiveConnections()).isEqualTo(2);
        assertThat(stats.getTotalTopics()).isEqualTo(10);
        assertThat(stats.getMonitoredTopics()).isEqualTo(4);
        assertThat(stats.getTotalMessages()).isEqualTo(5000L);
        assertThat(stats.getMessagesLast24h()).isEqualTo(1000L);
        assertThat(stats.getTopTopics()).hasSize(1);
        assertThat(stats.getTopTopics().get(0).getTopicName()).isEqualTo("hot-topic");
    }
}
