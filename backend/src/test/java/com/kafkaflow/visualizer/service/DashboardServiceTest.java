package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.DashboardStats;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import com.kafkaflow.visualizer.service.metrics.ThroughputTracker;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

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
    @Mock
    private ThroughputTracker throughputTracker;
    @Mock
    private KafkaConsumerManager consumerManager;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getDashboardStats_ShouldAggregateData() {
        // Given - Connections
        given(connectionRepository.count()).willReturn(5L);
        given(connectionRepository.countActiveConnections()).willReturn(2);

        // Given - Topics
        given(topicRepository.count()).willReturn(10L);
        given(topicRepository.countMonitoredTopics()).willReturn(4);

        KafkaTopic topTopic = KafkaTopic.builder()
                .name("hot-topic")
                .messageCount(100L)
                .build();
        given(topicRepository.findTopByMessageCount(anyInt())).willReturn(List.of(topTopic));

        // Given - Messages (DB)
        given(messageRepository.count()).willReturn(5000L);
        given(messageRepository.countMessagesSince(any(LocalDateTime.class))).willReturn(1000L);
        given(messageRepository.getMessageTrendsByHour(any(LocalDateTime.class))).willReturn(Collections.emptyList());

        // Given - Throughput (temps réel)
        given(throughputTracker.getGlobalThroughput()).willReturn(25.5);
        given(throughputTracker.getGlobalMessagesLastMinute()).willReturn(1530L);
        given(throughputTracker.isHourlyTrackingEnabled()).willReturn(true);
        given(throughputTracker.getGlobalMessagesLastHour()).willReturn(91800L);

        // Given - Consumers
        given(consumerManager.getActiveConsumerCount()).willReturn(4);
        given(consumerManager.getConsumerStatus()).willReturn(Map.of(
                1L, "RUNNING",
                2L, "RUNNING",
                3L, "RUNNING",
                4L, "STOPPED"
        ));

        // When
        DashboardStats stats = dashboardService.getDashboardStats();

        // Then - Connections
        assertThat(stats.getTotalConnections()).isEqualTo(5);
        assertThat(stats.getActiveConnections()).isEqualTo(2);

        // Then - Topics
        assertThat(stats.getTotalTopics()).isEqualTo(10);
        assertThat(stats.getMonitoredTopics()).isEqualTo(4);

        // Then - Consumers
        assertThat(stats.getActiveConsumers()).isEqualTo(4);
        assertThat(stats.getRunningThreads()).isEqualTo(3); // 3 RUNNING, 1 STOPPED

        // Then - Messages temps réel
        assertThat(stats.getMessagesPerSecond()).isEqualTo(25.5);
        assertThat(stats.getMessagesLastMinute()).isEqualTo(1530L);
        assertThat(stats.getMessagesLastHour()).isEqualTo(91800L);

        // Then - Messages historique
        assertThat(stats.getMessagesLast24h()).isEqualTo(1000L);
        assertThat(stats.getTotalMessagesStored()).isEqualTo(5000L);

        // Then - Top topics
        assertThat(stats.getTopTopics()).hasSize(1);
        assertThat(stats.getTopTopics().get(0).getTopicName()).isEqualTo("hot-topic");
    }

    @Test
    void getDashboardStats_WhenHourlyTrackingDisabled_ShouldFallbackToDatabase() {
        // Given - Minimal setup
        given(connectionRepository.count()).willReturn(1L);
        given(connectionRepository.countActiveConnections()).willReturn(1);
        given(topicRepository.count()).willReturn(1L);
        given(topicRepository.countMonitoredTopics()).willReturn(1);
        given(topicRepository.findTopByMessageCount(anyInt())).willReturn(Collections.emptyList());
        given(messageRepository.count()).willReturn(100L);
        given(messageRepository.countMessagesSince(any(LocalDateTime.class))).willReturn(50L);
        given(messageRepository.getMessageTrendsByHour(any(LocalDateTime.class))).willReturn(Collections.emptyList());

        // Given - Throughput avec hourly tracking désactivé
        given(throughputTracker.getGlobalThroughput()).willReturn(0.0);
        given(throughputTracker.getGlobalMessagesLastMinute()).willReturn(0L);
        given(throughputTracker.isHourlyTrackingEnabled()).willReturn(false);
        // Note: getGlobalMessagesLastHour() ne sera pas appelé car isHourlyTrackingEnabled = false

        // Given - Consumers
        given(consumerManager.getActiveConsumerCount()).willReturn(1);
        given(consumerManager.getConsumerStatus()).willReturn(Map.of(1L, "RUNNING"));

        // When
        DashboardStats stats = dashboardService.getDashboardStats();

        // Then - messagesLastHour devrait venir de la DB (50L du mock countMessagesSince)
        assertThat(stats.getMessagesLastHour()).isEqualTo(50L);
    }

    @Test
    void getDashboardStats_WhenNoActivity_ShouldReturnZeros() {
        // Given - Empty state
        given(connectionRepository.count()).willReturn(0L);
        given(connectionRepository.countActiveConnections()).willReturn(0);
        given(topicRepository.count()).willReturn(0L);
        given(topicRepository.countMonitoredTopics()).willReturn(0);
        given(topicRepository.findTopByMessageCount(anyInt())).willReturn(Collections.emptyList());
        given(messageRepository.count()).willReturn(0L);
        given(messageRepository.countMessagesSince(any(LocalDateTime.class))).willReturn(0L);
        given(messageRepository.getMessageTrendsByHour(any(LocalDateTime.class))).willReturn(Collections.emptyList());

        given(throughputTracker.getGlobalThroughput()).willReturn(0.0);
        given(throughputTracker.getGlobalMessagesLastMinute()).willReturn(0L);
        given(throughputTracker.isHourlyTrackingEnabled()).willReturn(true);
        given(throughputTracker.getGlobalMessagesLastHour()).willReturn(0L);

        given(consumerManager.getActiveConsumerCount()).willReturn(0);
        given(consumerManager.getConsumerStatus()).willReturn(Collections.emptyMap());

        // When
        DashboardStats stats = dashboardService.getDashboardStats();

        // Then
        assertThat(stats.getTotalConnections()).isZero();
        assertThat(stats.getActiveConsumers()).isZero();
        assertThat(stats.getMessagesPerSecond()).isZero();
        assertThat(stats.getTotalMessagesStored()).isZero();
        assertThat(stats.getTopTopics()).isEmpty();
    }
}