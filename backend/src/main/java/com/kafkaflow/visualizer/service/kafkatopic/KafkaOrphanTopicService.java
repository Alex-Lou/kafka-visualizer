package com.kafkaflow.visualizer.service.kafkatopic;

import com.kafkaflow.visualizer.dto.KafkaDto.TopicResponse;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaOrphanTopicService {

    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;

    @Transactional(readOnly = true)
    public List<TopicResponse> getOrphanTopics() {
        return topicRepository.findOrphanTopics().stream()
                .map(this::toOrphanTopicResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countOrphanTopics() {
        return topicRepository.countOrphanTopics();
    }

    @Transactional
    public OrphanDeleteResult deleteOrphanTopics(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new OrphanDeleteResult(0, 0, "No topics specified");
        }

        List<KafkaTopic> orphansToDelete = topicRepository.findOrphanTopicsByIds(ids);

        int requested = ids.size();
        int deleted = orphansToDelete.size();
        int skipped = requested - deleted;

        if (!orphansToDelete.isEmpty()) {
            for (KafkaTopic topic : orphansToDelete) {
                messageRepository.deleteByTopicId(topic.getId());
            }
            topicRepository.deleteAll(orphansToDelete);
            log.info("Deleted {} orphan topics (skipped {} non-orphan)", deleted, skipped);
        }

        String message = deleted > 0
                ? String.format("Successfully deleted %d orphan topic(s)", deleted)
                : "No orphan topics were deleted";

        if (skipped > 0) {
            message += String.format(" (%d skipped - not orphans)", skipped);
        }

        return new OrphanDeleteResult(deleted, skipped, message);
    }

    @Transactional
    public OrphanDeleteResult deleteAllOrphanTopics() {
        List<KafkaTopic> orphans = topicRepository.findOrphanTopics();

        if (orphans.isEmpty()) {
            return new OrphanDeleteResult(0, 0, "No orphan topics found");
        }

        int deleted = orphans.size();

        for (KafkaTopic topic : orphans) {
            messageRepository.deleteByTopicId(topic.getId());
        }
        topicRepository.deleteAll(orphans);

        log.info("Deleted all {} orphan topics", deleted);

        return new OrphanDeleteResult(deleted, 0,
                String.format("Successfully deleted %d orphan topic(s)", deleted));
    }

    private TopicResponse toOrphanTopicResponse(KafkaTopic topic) {
        String connectionName = "No connection";
        String connectionStatus = "DELETED";
        Long connectionId = null;

        if (topic.getConnection() != null) {
            connectionName = topic.getConnection().getName();
            connectionStatus = topic.getConnection().getStatus().name();
            connectionId = topic.getConnection().getId();
        }

        return TopicResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .connectionId(connectionId)
                .connectionName(connectionName)
                .connectionStatus(connectionStatus)
                .partitions(topic.getPartitions())
                .replicationFactor(topic.getReplicationFactor())
                .description(topic.getDescription())
                .color(topic.getColor())
                .monitored(topic.isMonitored())
                .messageCount(topic.getMessageCount())
                .lastMessageAt(topic.getLastMessageAt())
                .build();
    }

    public record OrphanDeleteResult(int deleted, int skipped, String message) {}
}