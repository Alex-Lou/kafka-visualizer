package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kafkaflow.visualizer.dto.ArchiveDto.*;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaMessageArchive;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaMessageArchiveRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.GZIPOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArchiveService {

    private final KafkaMessageArchiveRepository archiveRepository;
    private final KafkaMessageRepository messageRepository;
    private final KafkaTopicRepository topicRepository;

    private static final int MAX_PREVIEW_LENGTH = 200;
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // ═══════════════════════════════════════════════════════════════════════
    // READ OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

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

    public ArchiveResponse getArchiveById(Long id) {
        KafkaMessageArchive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archive not found: " + id));
        return toFullResponse(archive);
    }

    public ArchiveStats getStats() {
        long totalArchives = archiveRepository.countTotal();
        long totalSize = archiveRepository.getTotalSize();
        long archivedLast24h = archiveRepository.countArchivedSince(LocalDateTime.now().minusHours(24));
        long archivedLast7d = archiveRepository.countArchivedSince(LocalDateTime.now().minusDays(7));

        List<TopicArchiveStats> byTopic = archiveRepository.getStatsByTopic().stream()
                .map(row -> TopicArchiveStats.builder()
                        .topicId((Long) row[0])
                        .topicName((String) row[1])
                        .count((Long) row[2])
                        .sizeBytes((Long) row[3])
                        .sizeFormatted(formatSize((Long) row[3]))
                        .build())
                .collect(Collectors.toList());

        List<ConnectionArchiveStats> byConnection = archiveRepository.getStatsByConnection().stream()
                .map(row -> ConnectionArchiveStats.builder()
                        .connectionId((Long) row[0])
                        .connectionName((String) row[1])
                        .count((Long) row[2])
                        .sizeBytes((Long) row[3])
                        .sizeFormatted(formatSize((Long) row[3]))
                        .build())
                .collect(Collectors.toList());

        Map<MessageType, Long> byMessageType = archiveRepository.getCountByMessageType().stream()
                .collect(Collectors.toMap(
                        row -> (MessageType) row[0],
                        row -> (Long) row[1]
                ));

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
    // EXPORT OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    public ExportResponse exportArchives(ExportRequest request) {
        List<KafkaMessageArchive> archives;

        if (request.getIds() != null && !request.getIds().isEmpty()) {
            archives = archiveRepository.findByIdsOrdered(request.getIds());
        } else {
            archives = archiveRepository.findForExport(
                    request.getTopicId(),
                    request.getFromDate(),
                    request.getToDate()
            );
        }

        byte[] data;
        String filename;
        String contentType;

        switch (request.getFormat()) {
            case CSV:
                data = exportToCsv(archives, request);
                filename = generateFilename("archives", "csv", request.isCompress());
                contentType = request.isCompress() ? "application/gzip" : "text/csv";
                break;
            case NDJSON:
                data = exportToNdjson(archives, request);
                filename = generateFilename("archives", "ndjson", request.isCompress());
                contentType = request.isCompress() ? "application/gzip" : "application/x-ndjson";
                break;
            case JSON:
            default:
                data = exportToJson(archives, request);
                filename = generateFilename("archives", "json", request.isCompress());
                contentType = request.isCompress() ? "application/gzip" : "application/json";
                break;
        }

        if (request.isCompress()) {
            data = compress(data);
        }

        return ExportResponse.builder()
                .filename(filename)
                .contentType(contentType)
                .recordCount(archives.size())
                .sizeBytes(data.length)
                .data(data)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════
    // RESTORE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public RestoreResponse restoreArchives(RestoreRequest request) {
        List<KafkaMessageArchive> archives = archiveRepository.findAllById(request.getIds());
        int restored = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (KafkaMessageArchive archive : archives) {
            try {
                // Find the topic
                Optional<KafkaTopic> topicOpt = topicRepository.findById(archive.getTopicId());
                if (topicOpt.isEmpty()) {
                    errors.add("Topic not found for archive " + archive.getId());
                    failed++;
                    continue;
                }

                KafkaTopic topic = topicOpt.get();

                // Create a new message from archive
                KafkaMessage message = KafkaMessage.builder()
                        .topic(topic)
                        .key(archive.getMessageKey())
                        .value(archive.getMessageValue())
                        .partition(archive.getPartition())
                        .offset(archive.getOffset())
                        .timestamp(archive.getOriginalTimestamp())
                        .headers(convertHeadersToString(archive.getHeaders()))
                        .direction(KafkaMessage.MessageDirection.INBOUND)
                        .status(KafkaMessage.MessageStatus.RECEIVED)
                        .messageType(KafkaMessage.MessageType.valueOf(archive.getMessageType().name()))
                        .contentType(archive.getContentType())
                        .valueSize(archive.getValueSize())
                        .isBookmarked(false)
                        .build();

                messageRepository.save(message);

                // Update topic message count
                topic.setMessageCount((topic.getMessageCount() != null ? topic.getMessageCount() : 0) + 1);
                topicRepository.save(topic);

                if (request.isDeleteAfterRestore()) {
                    archiveRepository.delete(archive);
                }

                restored++;

            } catch (Exception e) {
                log.error("Failed to restore archive {}: {}", archive.getId(), e.getMessage());
                errors.add("Failed to restore archive " + archive.getId() + ": " + e.getMessage());
                failed++;
            }
        }

        return RestoreResponse.builder()
                .restored(restored)
                .failed(failed)
                .errors(errors)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COUNT FOR DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════

    public long getTotalArchivedCount() {
        return archiveRepository.countTotal();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
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
                .valueSizeFormatted(formatSize(archive.getValueSize()))
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

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }

    private String formatSize(Integer bytes) {
        return bytes != null ? formatSize((long) bytes) : "0 B";
    }

    private byte[] exportToJson(List<KafkaMessageArchive> archives, ExportRequest request) {
        try {
            List<Map<String, Object>> exportData = archives.stream()
                    .map(a -> buildExportMap(a, request))
                    .collect(Collectors.toList());
            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsBytes(exportData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export to JSON", e);
        }
    }

    private byte[] exportToNdjson(List<KafkaMessageArchive> archives, ExportRequest request) {
        try {
            StringBuilder sb = new StringBuilder();
            for (KafkaMessageArchive archive : archives) {
                sb.append(objectMapper.writeValueAsString(buildExportMap(archive, request)));
                sb.append("\n");
            }
            return sb.toString().getBytes(StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export to NDJSON", e);
        }
    }

    private byte[] exportToCsv(List<KafkaMessageArchive> archives, ExportRequest request) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append("id,topic_name,connection_name,message_key,message_value,partition,offset,timestamp,archived_at,message_type,content_type,size_bytes");
        if (request.isIncludeHeaders()) {
            sb.append(",headers");
        }
        sb.append("\n");

        // Data
        for (KafkaMessageArchive archive : archives) {
            sb.append(archive.getId()).append(",");
            sb.append(escapeCsv(archive.getTopicName())).append(",");
            sb.append(escapeCsv(archive.getConnectionName())).append(",");
            sb.append(escapeCsv(archive.getMessageKey())).append(",");
            sb.append(escapeCsv(archive.getMessageValue())).append(",");
            sb.append(archive.getPartition()).append(",");
            sb.append(archive.getOffset()).append(",");
            sb.append(archive.getOriginalTimestamp()).append(",");
            sb.append(archive.getArchivedAt()).append(",");
            sb.append(archive.getMessageType()).append(",");
            sb.append(escapeCsv(archive.getContentType())).append(",");
            sb.append(archive.getValueSize());
            if (request.isIncludeHeaders()) {
                sb.append(",").append(escapeCsv(String.valueOf(archive.getHeaders())));
            }
            sb.append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private Map<String, Object> buildExportMap(KafkaMessageArchive archive, ExportRequest request) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", archive.getId());
        map.put("topicName", archive.getTopicName());
        map.put("connectionName", archive.getConnectionName());
        map.put("messageKey", archive.getMessageKey());
        map.put("messageValue", archive.getMessageValue());
        map.put("partition", archive.getPartition());
        map.put("offset", archive.getOffset());
        map.put("timestamp", archive.getOriginalTimestamp());

        if (request.isIncludeHeaders() && archive.getHeaders() != null) {
            map.put("headers", archive.getHeaders());
        }

        if (request.isIncludeMetadata()) {
            map.put("archivedAt", archive.getArchivedAt());
            map.put("messageType", archive.getMessageType());
            map.put("contentType", archive.getContentType());
            map.put("valueSize", archive.getValueSize());
            map.put("archiveReason", archive.getArchiveReason());
        }

        return map;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private byte[] compress(byte[] data) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             GZIPOutputStream gzip = new GZIPOutputStream(bos)) {
            gzip.write(data);
            gzip.finish();
            return bos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compress data", e);
        }
    }

    private String generateFilename(String prefix, String extension, boolean compressed) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = prefix + "_" + timestamp + "." + extension;
        return compressed ? filename + ".gz" : filename;
    }

    private String convertHeadersToString(Map<String, String> headers) {
        if (headers == null || headers.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(headers);
        } catch (Exception e) {
            return null;
        }
    }
}