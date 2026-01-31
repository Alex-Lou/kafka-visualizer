package com.kafkaflow.visualizer.service.kafka;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.ErrorCategory;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.Log;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 🧹 Gestion centralisée des erreurs Kafka
 * - Consumer errors (existing)
 * - AdminClient connection errors (new)
 * - Clean error messages without stack traces
 */
@Component
@Slf4j
public class KafkaErrorHandler {

    // ═══════════════════════════════════════════════════════════════════
    // CONSUMER ERROR HANDLING (EXISTING LOGIC)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Log l'erreur consumer avec le message approprié selon la catégorie
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
     * Catégorise une exception Kafka (consumer)
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
        if (lower.contains("disconnect") || lower.contains("connection refused") || lower.contains("correlation id")) {
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

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN CLIENT CONNECTION ERROR HANDLING (NEW LOGIC)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Extrait un message d'erreur propre pour les opérations AdminClient
     * (test de connexion, discovery, metadata refresh, etc.)
     */
    public String extractCleanMessage(Exception e) {
        // Cas 1: TimeoutException standard
        if (e instanceof java.util.concurrent.TimeoutException) {
            return "Connection timeout - broker unreachable or wrong address";
        }

        // Cas 2: Kafka TimeoutException
        if (e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return "Kafka timeout - cannot reach bootstrap servers";
        }

        // Cas 3: ExecutionException wrappant une TimeoutException
        if (e instanceof java.util.concurrent.ExecutionException &&
                e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return "Kafka timeout - broker not responding";
        }

        // Cas 4: Connection refusée
        if (containsMessage(e, "Connection refused")) {
            return "Connection refused - broker not running on specified port";
        }

        // Cas 5: UnknownHostException
        if (e.getCause() instanceof java.net.UnknownHostException) {
            return "Unknown host - invalid hostname or DNS issue";
        }

        // Cas 6: Authentication errors
        if (containsMessage(e, "Authentication") || containsMessage(e, "SASL")) {
            return "Authentication failed - check credentials";
        }

        // Cas 7: Authorization errors
        if (containsMessage(e, "Authorization") || containsMessage(e, "Access denied")) {
            return "Authorization failed - insufficient permissions";
        }

        // Cas 8: SSL/TLS errors
        if (containsMessage(e, "SSL") || containsMessage(e, "TLS") || containsMessage(e, "certificate")) {
            return "SSL/TLS error - certificate issue or protocol mismatch";
        }

        // Cas 9: Network errors
        if (containsMessage(e, "Network") || containsMessage(e, "socket")) {
            return "Network error - connection interrupted";
        }

        // Cas 10: Broker errors
        if (containsMessage(e, "Broker") || containsMessage(e, "node assignment")) {
            return "Broker error - unable to assign node or find coordinator";
        }

        // Cas par défaut: message simplifié
        return simplifyConnectionError(e);
    }

    /**
     * Vérifie si le message d'erreur contient un terme
     */
    private boolean containsMessage(Exception e, String term) {
        if (e.getMessage() != null && e.getMessage().contains(term)) {
            return true;
        }
        // Vérifier aussi la cause
        if (e.getCause() != null && e.getCause().getMessage() != null) {
            return e.getCause().getMessage().contains(term);
        }
        return false;
    }

    /**
     * Simplifie un message d'erreur de connexion
     */
    private String simplifyConnectionError(Exception e) {
        String msg = e.getMessage();
        if (msg == null) {
            return e.getClass().getSimpleName();
        }

        // Nettoyer les préfixes Kafka
        msg = msg.replaceAll("org\\.apache\\.kafka\\.[a-z.]+\\.(\\w+)", "$1");

        // Tronquer si trop long
        if (msg.length() > 120) {
            return msg.substring(0, 120) + "...";
        }

        return msg;
    }

    /**
     * Log une erreur AdminClient avec contexte et stack trace conditionnelle
     */
    public void logConnectionError(String operation, String entityName, String details, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ {} failed", operation);
        log.error("   └─ Entity: {}", entityName);
        if (details != null && !details.isEmpty()) {
            log.error("   └─ Details: {}", details);
        }
        log.error("   └─ Error: {}", cleanError);
        log.error("   └─ Type: {}", e.getClass().getSimpleName());

        // Stack trace complet seulement en DEBUG
        if (log.isDebugEnabled()) {
            log.debug("   └─ Full stack trace:", e);
        }
    }

    /**
     * Log une erreur de connexion courte (pour test rapide)
     */
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

    /**
     * Log une erreur de découverte de topics
     */
    public void logTopicDiscoveryError(String connectionName, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ Topic discovery failed");
        log.error("   └─ Connection: {}", connectionName);
        log.error("   └─ Error: {}", cleanError);

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full error:", e);
        }
    }

    /**
     * Log une erreur de refresh metadata
     */
    public void logMetadataRefreshError(String connectionName, Exception e) {
        String cleanError = extractCleanMessage(e);

        log.error("❌ Metadata refresh failed");
        log.error("   └─ Connection: {}", connectionName);
        log.error("   └─ Error: {}", cleanError);

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full error:", e);
        }
    }

    /**
     * Log un warning (pour erreurs non-critiques)
     */
    public void logWarning(String operation, String reason) {
        log.warn("⚠️  {}: {}", operation, reason);
    }

    // ═══════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Détermine si une erreur est récupérable (retry possible)
     */
    public boolean isRecoverable(Exception e) {
        // TimeoutException et NetworkException sont généralement récupérables
        if (e instanceof java.util.concurrent.TimeoutException) {
            return true;
        }
        if (e.getCause() instanceof org.apache.kafka.common.errors.TimeoutException) {
            return true;
        }
        if (containsMessage(e, "timeout") || containsMessage(e, "network")) {
            return true;
        }

        // Auth/Authorization ne sont PAS récupérables
        if (containsMessage(e, "Authentication") || containsMessage(e, "Authorization")) {
            return false;
        }

        // Par défaut, considérer comme récupérable
        return true;
    }

    /**
     * Extrait le type d'erreur pour les métriques/monitoring
     */
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
