package com.kafkaflow.visualizer.service.archives;

import com.kafkaflow.visualizer.dto.ArchiveDto.*;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import com.kafkaflow.visualizer.repository.KafkaMessageArchiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArchiveStatsService {

    private final KafkaMessageArchiveRepository archiveRepository;

    @Transactional(readOnly = true)
    public ArchiveStats getStats() {
        long totalArchives = archiveRepository.countTotal();
        long totalSize = archiveRepository.getTotalSize();
        long archivedLast24h = archiveRepository.countArchivedSince(LocalDateTime.now().minusHours(24));
        long archivedLast7d = archiveRepository.countArchivedSince(LocalDateTime.now().minusDays(7));

        // Statistiques par Topic
        List<TopicArchiveStats> byTopic = archiveRepository.getStatsByTopic().stream()
                .map(row -> TopicArchiveStats.builder()
                        .topicId((Long) row[0])
                        .topicName((String) row[1])
                        .count((Long) row[2])
                        .sizeBytes((Long) row[3])
                        .sizeFormatted(formatSize((Long) row[3]))
                        .build())
                .collect(Collectors.toList());

        // Statistiques par Connection
        List<ConnectionArchiveStats> byConnection = archiveRepository.getStatsByConnection().stream()
                .map(row -> ConnectionArchiveStats.builder()
                        .connectionId((Long) row[0])
                        .connectionName((String) row[1])
                        .count((Long) row[2])
                        .sizeBytes((Long) row[3])
                        .sizeFormatted(formatSize((Long) row[3]))
                        .build())
                .collect(Collectors.toList());

        // Répartition par type de message
        Map<MessageType, Long> byMessageType = archiveRepository.getCountByMessageType().stream()
                .collect(Collectors.toMap(
                        row -> (MessageType) row[0],
                        row -> (Long) row[1]
                ));

        // Répartition par raison d'archivage
        Map<ArchiveReason, Long> byArchiveReason = archiveRepository.getCountByArchiveReason().stream()
                .collect(Collectors.toMap(
                        row -> (ArchiveReason) row[0],
                        row -> (Long) row[1]
                ));

        return ArchiveStats.builder()
                .totalArchives(totalArchives)
                .totalSizeBytes(totalSize)
                .totalSizeFormatted(formatSize(totalSize))
                .archivedLast24h(archivedLast24h)
                .archivedLast7d(archivedLast7d)
                .byTopic(byTopic)
                .byConnection(byConnection)
                .byMessageType(byMessageType)
                .byArchiveReason(byArchiveReason)
                .build();
    }

    @Transactional(readOnly = true)
    public long getTotalArchivedCount() {
        return archiveRepository.countTotal();
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }
}