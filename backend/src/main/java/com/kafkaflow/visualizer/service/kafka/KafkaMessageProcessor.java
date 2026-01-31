package com.kafkaflow.visualizer.service.kafka;

import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.service.kafkatopic.KafkaTopicMessageService;
import com.kafkaflow.visualizer.service.metrics.MetricsBroadcaster;
import com.kafkaflow.visualizer.service.metrics.ThroughputTracker;
import com.kafkaflow.visualizer.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Traitement des messages Kafka reçus
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaMessageProcessor {

    private final KafkaTopicMessageService messageService;  // ← Changé
    private final WebSocketService webSocketService;
    private final ThroughputTracker throughputTracker;
    private final MetricsBroadcaster metricsBroadcaster;
    private final KafkaErrorHandler errorHandler;

    /**
     * Traite un batch de records et retourne le nombre d'erreurs
     */
    public int processRecords(Long topicId, String topicName, ConsumerRecords<String, String> records) {
        int recordCount = records.count();

        throughputTracker.recordMessages(topicId, recordCount);

        int errors = 0;
        for (ConsumerRecord<String, String> record : records) {
            if (!processRecord(topicId, record)) {
                errors++;
            }
        }

        errorHandler.handleBatchProcessingErrors(topicName, errors);

        metricsBroadcaster.broadcastTopicUpdate(topicId);
        metricsBroadcaster.broadcastFlowUpdates(topicId);

        return errors;
    }

    /**
     * Traite un seul record - retourne true si succès
     */
    private boolean processRecord(Long topicId, ConsumerRecord<String, String> record) {
        try {
            Map<String, String> headers = extractHeaders(record);

            var messageResponse = messageService.saveMessage(  // ← Changé
                    topicId,
                    KafkaMessage.MessageDirection.INBOUND,
                    record.key(),
                    record.value(),
                    record.partition(),
                    record.offset(),
                    headers
            );

            webSocketService.broadcastNewMessage(messageResponse);
            return true;

        } catch (Exception e) {
            log.trace("Message processing failed: {}", e.getMessage());
            return false;
        }
    }

    private Map<String, String> extractHeaders(ConsumerRecord<String, String> record) {
        Map<String, String> headers = new HashMap<>();
        record.headers().forEach(header ->
                headers.put(header.key(), new String(header.value()))
        );
        return headers;
    }
}