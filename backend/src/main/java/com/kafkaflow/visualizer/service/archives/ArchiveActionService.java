package com.kafkaflow.visualizer.service.archives;

import com.kafkaflow.visualizer.dto.ArchiveDto.*;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaMessageArchive;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaMessageArchiveRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class ArchiveActionService {

    private final KafkaMessageArchiveRepository archiveRepository;
    private final KafkaMessageRepository messageRepository;
    private final KafkaTopicRepository topicRepository;

    /**
     * Suppression en masse selon différents critères
     */
    @Transactional
    public BulkOperationResponse deleteArchives(BulkDeleteRequest request) {
        int deleted = 0;

        if (request.getIds() != null && !request.getIds().isEmpty()) {
            deleted = archiveRepository.deleteByIds(request.getIds());
        } else if (request.getTopicId() != null) {
            deleted = archiveRepository.deleteByTopicId(request.getTopicId());
        } else if (request.getConnectionId() != null) {
            deleted = archiveRepository.deleteByConnectionId(request.getConnectionId());
        } else if (request.getOlderThan() != null) {
            deleted = archiveRepository.deleteExpiredArchives(request.getOlderThan());
        }

        log.info("Deleted {} archives", deleted);

        return BulkOperationResponse.builder()
                .affected(deleted)
                .message("Deleted " + deleted + " archives")
                .build();
    }

    /**
     * Restauration unitaire (Solution B : Pas de @Transactional global)
     */
    public RestoreResponse restoreArchives(RestoreRequest request) {
        List<KafkaMessageArchive> archives = archiveRepository.findAllById(request.getIds());
        int restored = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (KafkaMessageArchive archive : archives) {
            try {
                KafkaTopic topic = topicRepository.findById(archive.getTopicId())
                        .orElseThrow(() -> new ResourceNotFoundException("Topic", archive.getTopicId()));

                KafkaMessage message = KafkaMessage.builder()
                        .topic(topic)
                        .key(archive.getMessageKey())
                        .value(archive.getMessageValue())
                        .partition(archive.getPartition())
                        .offset(archive.getOffset())
                        .timestamp(archive.getOriginalTimestamp())
                        .direction(KafkaMessage.MessageDirection.INBOUND)
                        .status(KafkaMessage.MessageStatus.RECEIVED)
                        .messageType(KafkaMessage.MessageType.valueOf(archive.getMessageType().name()))
                        .contentType(archive.getContentType())
                        .valueSize(archive.getValueSize())
                        .isBookmarked(false)
                        .build();

                messageRepository.saveAndFlush(message);

                topic.setMessageCount((topic.getMessageCount() != null ? topic.getMessageCount() : 0) + 1);
                topicRepository.saveAndFlush(topic);

                if (request.isDeleteAfterRestore()) {
                    archiveRepository.delete(archive);
                }

                restored++;

            } catch (Exception e) {
                log.error("Failed to restore archive {}: {}", archive.getId(), e.getMessage());
                errors.add("Archive ID " + archive.getId() + ": " + e.getMessage());
                failed++;
            }
        }

        return RestoreResponse.builder()
                .restored(restored)
                .failed(failed)
                .errors(errors)
                .build();
    }
}