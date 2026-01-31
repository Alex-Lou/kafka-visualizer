package com.kafkaflow.visualizer.service.archives;

import com.kafkaflow.visualizer.dto.ArchiveDto.*;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaMessageArchive;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import com.kafkaflow.visualizer.repository.KafkaMessageArchiveRepository;
import com.kafkaflow.visualizer.util.FormatUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class ArchiveSearchService {

    private final KafkaMessageArchiveRepository archiveRepository;
    private static final int MAX_PREVIEW_LENGTH = 200;
    /**
     * Récupère la liste paginée et filtrée des archives
     */
    @Transactional(readOnly = true)
    public Page<ArchiveResponse> getArchives(ArchiveFilterRequest filter) {
        Pageable pageable = buildPageable(filter);

        Page<KafkaMessageArchive> archives;

        if (filter.getSearchQuery() != null && !filter.getSearchQuery().isBlank()) {
            archives = archiveRepository.searchFullText(filter.getSearchQuery(), pageable);
        } else {
            archives = archiveRepository.findByFilters(
                    filter.getTopicId(),
                    filter.getConnectionId(),
                    filter.getTopicName(),
                    filter.getMessageKey(),
                    filter.getValueContains(),
                    filter.getFromDate(),
                    filter.getToDate(),
                    filter.getMessageType(),
                    filter.getArchiveReason(),
                    filter.getContentType(),
                    pageable
            );
        }

        return archives.map(this::toResponse);
    }

    /**
     * Récupère le détail complet d'une archive par son ID
     */
    @Transactional(readOnly = true)
    public ArchiveResponse getArchiveById(Long id) {
        return archiveRepository.findById(id)
                .map(this::toFullResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Archive", id));
    }

    /**
     * Récupère les options de filtres disponibles dynamiquement
     */
    @Transactional(readOnly = true)
    public FilterOptions getFilterOptions() {
        return FilterOptions.builder()
                .topicNames(archiveRepository.findDistinctTopicNames())
                .connectionNames(archiveRepository.findDistinctConnectionNames())
                .contentTypes(archiveRepository.findDistinctContentTypes())
                .messageTypes(Arrays.asList(MessageType.values()))
                .archiveReasons(Arrays.asList(ArchiveReason.values()))
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS DE MAPPING (Spécifiques à la lecture)
    // ═══════════════════════════════════════════════════════════════════════

    private Pageable buildPageable(ArchiveFilterRequest filter) {
        int page = filter.getPage() > 0 ? filter.getPage() : 0;
        int size = filter.getSize() > 0 ? Math.min(filter.getSize(), 100) : 20;

        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "originalTimestamp";
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDirection())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private ArchiveResponse toResponse(KafkaMessageArchive archive) {
        return ArchiveResponse.builder()
                .id(archive.getId())
                .topicId(archive.getTopicId())
                .topicName(archive.getTopicName())
                .connectionId(archive.getConnectionId())
                .connectionName(archive.getConnectionName())
                .messageKey(archive.getMessageKey())
                .messageValuePreview(truncate(archive.getMessageValue(), MAX_PREVIEW_LENGTH))
                .partition(archive.getPartition())
                .offset(archive.getOffset())
                .originalTimestamp(archive.getOriginalTimestamp())
                .archivedAt(archive.getArchivedAt())
                .messageType(archive.getMessageType())
                .contentType(archive.getContentType())
                .valueSize(archive.getValueSize())
                .valueSizeFormatted(FormatUtils.formatSize(archive.getValueSize()))
                .archiveReason(archive.getArchiveReason())
                .build();
    }

    private ArchiveResponse toFullResponse(KafkaMessageArchive archive) {
        ArchiveResponse response = toResponse(archive);
        response.setMessageValue(archive.getMessageValue());
        response.setHeaders(archive.getHeaders());
        return response;
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, maxLength) + "...";
    }


}