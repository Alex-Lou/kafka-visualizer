package com.kafkaflow.visualizer.service.kafka;

import com.kafkaflow.visualizer.service.HealthService;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.*;

/**
 * Tâche de consommation pour un topic unique
 */
@Slf4j
public class ConsumerTask implements Runnable {

    private final Long topicId;
    private final String topicName;
    private final KafkaConsumer<String, String> consumer;
    private final KafkaMessageProcessor messageProcessor;
    private final KafkaErrorHandler errorHandler;
    private final HealthService healthService;
    private final AtomicBoolean running;
    private final AtomicInteger consecutiveErrors = new AtomicInteger(0);

    public ConsumerTask(
            Long topicId,
            String topicName,
            KafkaConsumer<String, String> consumer,
            KafkaMessageProcessor messageProcessor,
            KafkaErrorHandler errorHandler,
            HealthService healthService,
            AtomicBoolean running
    ) {
        this.topicId = topicId;
        this.topicName = topicName;
        this.consumer = consumer;
        this.messageProcessor = messageProcessor;
        this.errorHandler = errorHandler;
        this.healthService = healthService;
        this.running = running;
    }

    @Override
    public void run() {
        try {
            consumeLoop();
        } finally {
            closeQuietly();
        }
    }

    private void consumeLoop() {
        while (running.get()) {
            try {
                ConsumerRecords<String, String> records = consumer.poll(POLL_TIMEOUT);

                if (!records.isEmpty()) {
                    consecutiveErrors.set(0);
                    healthService.recordMessages(records.count());
                    messageProcessor.processRecords(topicId, topicName, records);
                }

            } catch (WakeupException e) {
                // Shutdown signal - sortir proprement
                break;

            } catch (Exception e) {
                if (handleError(e)) {
                    break; // Trop d'erreurs - arrêter
                }
                sleep(RETRY_DELAY_MS);
            }
        }
    }

    /**
     * Gère une erreur - retourne true si on doit arrêter
     */
    private boolean handleError(Exception e) {
        int errors = consecutiveErrors.incrementAndGet();
        errorHandler.handleConsumerError(topicName, e, errors);

        if (errors >= MAX_CONSECUTIVE_ERRORS) {
            errorHandler.handleTooManyErrors(topicName, errors);
            return true;
        }

        return false;
    }

    /**
     * Signale l'arrêt du consumer
     */
    public void stop() {
        try {
            consumer.wakeup();
        } catch (Exception e) {
            // Ignore
        }
    }

    private void closeQuietly() {
        try {
            consumer.close();
            log.debug("✓ Consumer closed [{}]", topicName);
        } catch (Exception e) {
            // Ignore
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}