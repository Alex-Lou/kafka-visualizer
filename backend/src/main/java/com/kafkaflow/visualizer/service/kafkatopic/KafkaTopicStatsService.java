package com.kafkaflow.visualizer.service.kafkatopic;

import com.kafkaflow.visualizer.dto.KafkaDto.TopicLiveStatsResponse;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaTopicStatsService {

    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;

    @Transactional(readOnly = true)
    public TopicLiveStatsResponse getLiveStats(Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24h = now.minusHours(24);
        LocalDateTime lastHour = now.minusHours(1);
        LocalDateTime lastMinute = now.minusMinutes(1);

        long totalMessages = messageRepository.countByTopicId(topicId);
        long messagesLast24h = messageRepository.countByTopicIdAndTimestampAfter(topicId, last24h);
        long messagesLastHour = messageRepository.countByTopicIdAndTimestampAfter(topicId, lastHour);
        long messagesLastMinute = messageRepository.countByTopicIdAndTimestampAfter(topicId, lastMinute);

        long errorCount = messageRepository.countByTopicIdAndMessageTypeAndTimestampAfter(
                topicId, KafkaMessage.MessageType.ERROR, last24h);
        long warningCount = messageRepository.countByTopicIdAndMessageTypeAndTimestampAfter(
                topicId, KafkaMessage.MessageType.WARNING, last24h);

        Optional<KafkaMessage> lastMessage = messageRepository.findFirstByTopicIdOrderByTimestampDesc(topicId);
        Long totalSize = messageRepository.getTotalSizeByTopicId(topicId);

        return TopicLiveStatsResponse.builder()
                .topicId(topicId)
                .topicName(topic.getName())
                .totalMessages(totalMessages)
                .messagesLast24h(messagesLast24h)
                .messagesLastHour(messagesLastHour)
                .errorCount(errorCount)
                .warningCount(warningCount)
                .throughputPerSecond(messagesLastMinute / 60.0)
                .throughputPerMinute((double) messagesLastMinute)
                .totalSizeBytes(totalSize != null ? totalSize : 0L)
                .totalSizeFormatted(formatBytes(totalSize != null ? totalSize : 0L))
                .lastMessageAt(lastMessage.map(KafkaMessage::getTimestamp).orElse(null))
                .isMonitored(topic.isMonitored())
                .consumerActive(false)
                .build();
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}