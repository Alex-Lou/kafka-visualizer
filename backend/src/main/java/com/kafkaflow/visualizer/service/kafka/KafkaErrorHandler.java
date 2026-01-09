package com.kafkaflow.visualizer.service.kafka;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.ErrorCategory;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.Log;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Gestion centralisée des erreurs Kafka
 */
@Component
@Slf4j
public class KafkaErrorHandler {

    /**
     * Log l'erreur avec le message approprié selon la catégorie
     */
    public void handleConsumerError(String topicName, Exception e, int errorCount) {
        ErrorCategory category = categorize(e);

        switch (category) {
            case LEADER_NOT_AVAILABLE -> log.warn(Log.ERROR_LEADER, topicName);
            case TIMEOUT -> log.warn(Log.ERROR_TIMEOUT, topicName);
            case DISCONNECT -> log.warn(Log.ERROR_DISCONNECT, topicName);
            case AUTH -> log.error(Log.ERROR_AUTH, topicName);
            default -> {
                if (errorCount <= 2) {
                    log.warn(Log.ERROR_GENERIC, topicName, errorCount, simplify(e));
                }
            }
        }
    }

    /**
     * Log quand trop d'erreurs consécutives
     */
    public void handleTooManyErrors(String topicName, int errorCount) {
        log.error(Log.ERROR_TOO_MANY, topicName, errorCount);
    }

    /**
     * Log les erreurs de processing par batch
     */
    public void handleBatchProcessingErrors(String topicName, int errorCount) {
        if (errorCount > 1) {
            log.warn(Log.ERROR_PROCESSING, topicName, errorCount);
        }
    }

    /**
     * Catégorise une exception Kafka
     */
    public ErrorCategory categorize(Exception e) {
        String message = e.getMessage();
        if (message == null) return ErrorCategory.UNKNOWN;

        String lower = message.toLowerCase();

        if (lower.contains("leader_not_available") || lower.contains("leader not available")) {
            return ErrorCategory.LEADER_NOT_AVAILABLE;
        }
        if (lower.contains("timeout") || lower.contains("timed out")) {
            return ErrorCategory.TIMEOUT;
        }
        if (lower.contains("disconnect") || lower.contains("connection refused")) {
            return ErrorCategory.DISCONNECT;
        }
        if (lower.contains("auth") || lower.contains("sasl") || lower.contains("credential")) {
            return ErrorCategory.AUTH;
        }

        return ErrorCategory.UNKNOWN;
    }

    /**
     * Simplifie un message d'erreur pour les logs
     */
    public String simplify(Exception e) {
        String message = e.getMessage();
        if (message == null) {
            return e.getClass().getSimpleName();
        }

        // Nettoyer les préfixes de packages
        message = message.replaceAll("org\\.[a-z.]+\\.(\\w+Exception)", "$1");

        // Tronquer si trop long
        if (message.length() > 100) {
            message = message.substring(0, 100) + "...";
        }

        return message;
    }
}