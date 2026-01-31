package com.kafkaflow.visualizer.service.archives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kafkaflow.visualizer.dto.ArchiveDto.ExportRequest;
import com.kafkaflow.visualizer.dto.ArchiveDto.ExportResponse;
import com.kafkaflow.visualizer.exception.ExportException;
import com.kafkaflow.visualizer.model.KafkaMessageArchive;
import com.kafkaflow.visualizer.repository.KafkaMessageArchiveRepository;
import lombok.RequiredArgsConstructor;
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
public class ArchiveExportService {

    private final KafkaMessageArchiveRepository archiveRepository;

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Transactional(readOnly = true)
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

        // Choix du format et génération de la donnée
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
    // MÉTHODES PRIVÉES DE FORMATAGE (JSON, CSV, NDJSON)
    // ═══════════════════════════════════════════════════════════════════════

    private byte[] exportToJson(List<KafkaMessageArchive> archives, ExportRequest request) {
        try {
            List<Map<String, Object>> exportData = archives.stream()
                    .map(a -> buildExportMap(a, request))
                    .collect(Collectors.toList());
            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsBytes(exportData);
        } catch (Exception e) {
            throw new ExportException("Failed to export to JSON", e);
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
            throw new ExportException("Failed to export to NDJSON", e);
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
            throw new ExportException("Failed to compress data", e);
        }
    }

    private String generateFilename(String prefix, String extension, boolean compressed) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = prefix + "_" + timestamp + "." + extension;
        return compressed ? filename + ".gz" : filename;
    }
}