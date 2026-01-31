package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RetentionManualService {

    private final KafkaMessageRepository messageRepository;
    private final KafkaMessageArchiveRepository archiveRepository;
    private final KafkaTopicRepository topicRepository;

    private static final int BATCH_SIZE = 100;

    @Transactional
    public int archiveTopicMessages(Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        int totalArchived = 0;
        List<KafkaMessage> batch;

        do {
            batch = messageRepository.findTop100ByTopicIdOrderByTimestampDesc(topicId);

            if (batch.isEmpty()) {
                break;
            }

            List<KafkaMessageArchive> archives = new ArrayList<>(batch.size());
            List<Long> idsToDelete = new ArrayList<>(batch.size());

            for (KafkaMessage message : batch) {
                archives.add(KafkaMessageArchive.fromMessage(
                        message, topic.getName(), topic.getConnection().getId(),
                        topic.getConnection().getName(), ArchiveReason.MANUAL));
                idsToDelete.add(message.getId());
            }

            archiveRepository.saveAll(archives);
            messageRepository.deleteAllById(idsToDelete);
            totalArchived += batch.size();

        } while (!batch.isEmpty());

        log.info("Manually archived {} messages for topic {}", totalArchived, topic.getName());
        return totalArchived;
    }

    @Transactional
    public int archiveSpecificMessages(List<Long> messageIds) {
        List<KafkaMessage> messages = messageRepository.findAllById(messageIds);

        if (messages.isEmpty()) {
            return 0;
        }

        List<KafkaMessageArchive> archives = new ArrayList<>(messages.size());
        List<Long> idsToDelete = new ArrayList<>(messages.size());

        for (KafkaMessage message : messages) {
            KafkaTopic topic = message.getTopic();
            archives.add(KafkaMessageArchive.fromMessage(
                    message, topic.getName(), topic.getConnection().getId(),
                    topic.getConnection().getName(), ArchiveReason.MANUAL));
            idsToDelete.add(message.getId());
        }

        archiveRepository.saveAll(archives);
        messageRepository.deleteAllById(idsToDelete);

        log.info("Manually archived {} specific messages", archives.size());
        return archives.size();
    }

    @Transactional
    public int archiveTopics(List<Long> topicIds) {
        int totalArchived = 0;
        for (Long topicId : topicIds) {
            totalArchived += archiveTopicMessages(topicId);
        }
        log.info("Manually archived messages from {} topics", topicIds.size());
        return totalArchived;
    }

    @Transactional
    public int resetTopic(Long topicId, boolean deleteArchives) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        int hotDeleted = messageRepository.deleteByTopicId(topicId);
        int archiveDeleted = 0;

        if (deleteArchives) {
            archiveDeleted = archiveRepository.deleteByTopicId(topicId);
        }

        topic.setMessageCount(0L);
        topic.setLastMessageAt(null);
        topicRepository.save(topic);

        log.info("Reset topic {}: {} hot messages, {} archives deleted",
                topic.getName(), hotDeleted, archiveDeleted);
        return hotDeleted + archiveDeleted;
    }

    @Transactional
    public int purgeMessagesOlderThan(LocalDateTime cutoff, boolean archiveFirst) {
        if (archiveFirst) {
            List<KafkaTopic> topics = topicRepository.findAll();

            for (KafkaTopic topic : topics) {
                List<KafkaMessage> messages = messageRepository.findByTopicIdAndTimestampBefore(
                        topic.getId(), cutoff, PageRequest.of(0, BATCH_SIZE));

                if (messages.isEmpty()) {
                    continue;
                }

                List<KafkaMessageArchive> archives = new ArrayList<>(messages.size());
                for (KafkaMessage message : messages) {
                    archives.add(KafkaMessageArchive.fromMessage(
                            message, topic.getName(), topic.getConnection().getId(),
                            topic.getConnection().getName(), ArchiveReason.CLEANUP));
                }
                archiveRepository.saveAll(archives);
            }
        }
        return messageRepository.deleteOlderThan(cutoff);
    }

    @Transactional
    public void bookmarkMessage(Long messageId, boolean bookmarked) {
        KafkaMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", messageId));
        message.setIsBookmarked(bookmarked);
        messageRepository.save(message);
    }
}