package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;

    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);

        List<TopicStats> topTopics = topicRepository.findTopByMessageCount(5).stream()
                .map(topic -> TopicStats.builder()
                        .topicName(topic.getName())
                        .messageCount(topic.getMessageCount())
                        .color(topic.getColor())
                        .build())
                .collect(Collectors.toList());

        List<MessageTrend> messageTrends = messageRepository.getMessageTrendsByHour(last24Hours).stream()
                .map(row -> MessageTrend.builder()
                        .hour(String.valueOf(row[0]))
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalConnections((int) connectionRepository.count())
                .activeConnections(connectionRepository.countActiveConnections())
                .totalTopics((int) topicRepository.count())
                .monitoredTopics(topicRepository.countMonitoredTopics())
                .totalMessages(messageRepository.count())
                .messagesLast24h(messageRepository.countMessagesSince(last24Hours))
                .topTopics(topTopics)
                .messageTrends(messageTrends)
                .build();
    }
}
