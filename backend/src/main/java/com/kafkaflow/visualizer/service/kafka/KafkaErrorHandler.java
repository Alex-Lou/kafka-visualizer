package com.kafkaflow.visualizer.service.kafka;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.ErrorCategory;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.Log;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class KafkaErrorHandler {

    // ═══════════════════════════════════════════════════════════════════
    // CONSUMER ERROR HANDLING (EXISTING LOGIC)
    // ═══════════════════════════════════════════════════════════════════

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

    public void handleTooManyErrors(String topicName, int errorCount) {
        log.error(Log.ERROR_TOO_MANY, topicName, errorCount);
    }

    public void handleBatchProcessingErrors(String topicName, int errorCount) {
        if (errorCount > 1) {
            log.warn(Log.ERROR_PROCESSING, topicName, errorCount);
        }
    }

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
        if (lower.contains("disconnect") || lower.contains("connection refused") || lower.contains("correlation id")) {
            return ErrorCategory.DISCONNECT;
        }
        if (lower.contains("auth") || lower.contains("sasl") || lower.contains("credential")) {
            return ErrorCategory.AUTH;
        }

        return ErrorCategory.UNKNOWN;
    }

    public String simplify(Exception e) {
        String message = e.getMessage();
        if (message == null) {
            return e.getClass().getSimpleName();
        }

        message = message.replaceAll("org\\.[a-z.]+\\.(\\w+Exception)", "$1");

        if (message.length() > 100) {
            message = message.substring(0, 100) + "...";
        }

        return message;
    }

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN CLIENT CONNECTION ERROR HANDLING (NEW LOGIC)
    // ═══════════════════════════════════════════════════════════════════

    public String extractCleanMessage(Exception e) {
        if (e instanceof java.util.concurrent.TimeoutException) {
            return "Connection timeout - broker unreachable or wrong address";
        }

        if (e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return "Kafka timeout - cannot reach bootstrap servers";
        }

        if (e instanceof java.util.concurrent.ExecutionException &&
                e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return "Kafka timeout - broker not responding";
        }

        if (containsMessage(e, "Connection refused")) {
            return "Connection refused - broker not running on specified port";
        }

        if (e.getCause() instanceof java.net.UnknownHostException) {
            return "Unknown host - invalid hostname or DNS issue";
        }

        if (containsMessage(e, "Authentication") || containsMessage(e, "SASL")) {
            return "Authentication failed - check credentials";
        }

        if (containsMessage(e, "Authorization") || containsMessage(e, "Access denied")) {
            return "Authorization failed - insufficient permissions";
        }

        if (containsMessage(e, "SSL") || containsMessage(e, "TLS") || containsMessage(e, "certificate")) {
            return "SSL/TLS error - certificate issue or protocol mismatch";
        }

        if (containsMessage(e, "Network") || containsMessage(e, "socket")) {
            return "Network error - connection interrupted";
        }

        if (containsMessage(e, "Broker") || containsMessage(e, "node assignment")) {
            return "Broker error - unable to assign node or find coordinator";
        }

        return simplifyConnectionError(e);
    }

    private boolean containsMessage(Exception e, String term) {
        if (e.getMessage() != null && e.getMessage().contains(term)) {
            return true;
        }
        if (e.getCause() != null && e.getCause().getMessage() != null) {
            return e.getCause().getMessage().contains(term);
        }
        return false;
    }

    private String simplifyConnectionError(Exception e) {
        String msg = e.getMessage();
        if (msg == null) {
            return e.getClass().getSimpleName();
        }

        msg = msg.replaceAll("org\\.apache\\.kafka\\.[a-z.]+\\.(\\w+)", "$1");

        if (msg.length() > 120) {
            return msg.substring(0, 120) + "...";
        }

        return msg;
    }

    public void logConnectionError(String operation, String entityName, String details, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ {} failed", operation);
        log.error("   └─ Entity: {}", entityName);
        if (details != null && !details.isEmpty()) {
            log.error("   └─ Details: {}", details);
        }
        log.error("   └─ Error: {}", cleanError);
        log.error("   └─ Type: {}", e.getClass().getSimpleName());

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full stack trace:", e);
        }
    }

    public void logConnectionTestError(String connectionName, String broker, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ Connection test failed");
        log.error("   └─ Name: {}", connectionName);
        log.error("   └─ Broker: {}", broker);
        log.error("   └─ Error: {}", cleanError);

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full error:", e);
        }
    }

    public void logTopicDiscoveryError(String connectionName, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ Topic discovery failed");
        log.error("   └─ Connection: {}", connectionName);
        log.error("   └─ Error: {}", cleanError);

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full error:", e);
        }
    }

    public void logMetadataRefreshError(String connectionName, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ Metadata refresh failed");
        log.error("   └─ Connection: {}", connectionName);
        log.error("   └─ Error: {}", cleanError);

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full error:", e);
        }
    }

    public void logWarning(String operation, String reason) {
        log.warn("⚠️  {}: {}", operation, reason);
    }

    // ═══════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════

    public boolean isRecoverable(Exception e) {
        if (e instanceof java.util.concurrent.TimeoutException) {
            return true;
        }
        if (e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return true;
        }
        if (containsMessage(e, "timeout") || containsMessage(e, "network")) {
            return true;
        }

        if (containsMessage(e, "Authentication") || containsMessage(e, "Authorization")) {
            return false;
        }

        return true;
    }

    public String getErrorType(Exception e) {
        if (e instanceof java.util.concurrent.TimeoutException) {
            return "TIMEOUT";
        }
        if (e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return "KAFKA_TIMEOUT";
        }
        if (e.getCause() instanceof java.net.UnknownHostException) {
            return "UNKNOWN_HOST";
        }
        if (containsMessage(e, "Connection refused")) {
            return "CONNECTION_REFUSED";
        }
        if (containsMessage(e, "Authentication")) {
            return "AUTH_FAILED";
        }
        if (containsMessage(e, "Authorization")) {
            return "AUTHZ_FAILED";
        }
        if (containsMessage(e, "SSL") || containsMessage(e, "TLS")) {
            return "SSL_ERROR";
        }

        return "UNKNOWN";
    }
}