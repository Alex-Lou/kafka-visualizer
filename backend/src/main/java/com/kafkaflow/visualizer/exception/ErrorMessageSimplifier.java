package com.kafkaflow.visualizer.exception;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Utilitaire pour simplifier les messages d'erreur (logs et API)
 */
public final class ErrorMessageSimplifier {

    private ErrorMessageSimplifier() {} // Pas d'instanciation

    private static final int MAX_LENGTH = 150;

    // ═══════════════════════════════════════════════════════════════════════
    // PATTERNS
    // ═══════════════════════════════════════════════════════════════════════

    private static final Pattern PACKAGE_PREFIX = Pattern.compile("org\\.[a-z.]+\\.(\\w+Exception)");
    private static final Pattern LAZY_ENTITY = Pattern.compile(".*\\[([\\w.]+)#(\\d+)].*");

    private static final Map<Pattern, String> DB_ERROR_PATTERNS = Map.ofEntries(
            Map.entry(Pattern.compile("(?i)connection refused"), "Database connection refused"),
            Map.entry(Pattern.compile("(?i)duplicate entry"), "Duplicate entry in database"),
            Map.entry(Pattern.compile("(?i)foreign key constraint"), "Related data still exists"),
            Map.entry(Pattern.compile("(?i)data too long"), "Data exceeds field size limit"),
            Map.entry(Pattern.compile("(?i)cannot delete or update a parent row"), "Cannot delete: related data exists"),
            Map.entry(Pattern.compile("(?i)unknown column"), "Invalid database column"),
            Map.entry(Pattern.compile("(?i)table .* doesn't exist"), "Database table not found"),
            Map.entry(Pattern.compile("(?i)access denied"), "Database access denied")
    );

    private static final Map<Pattern, String> KAFKA_ERROR_PATTERNS = Map.ofEntries(
            Map.entry(Pattern.compile("(?i)leader.?not.?available"), "Kafka leader not available"),
            Map.entry(Pattern.compile("(?i)timeout|timed.?out"), "Connection timeout"),
            Map.entry(Pattern.compile("(?i)disconnect"), "Broker disconnected"),
            Map.entry(Pattern.compile("(?i)connection.?refused"), "Broker connection refused"),
            Map.entry(Pattern.compile("(?i)auth|sasl|credential"), "Authentication failed"),
            Map.entry(Pattern.compile("(?i)unknown.?topic"), "Topic does not exist")
    );

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Simplifie un message d'erreur générique
     */
    public static String simplify(Exception e) {
        if (e == null) return "Unknown error";

        String message = e.getMessage();
        if (message == null) {
            return e.getClass().getSimpleName();
        }

        // Nettoyer les préfixes de packages Java
        message = PACKAGE_PREFIX.matcher(message).replaceAll("$1");

        return truncate(message);
    }

    /**
     * Simplifie un message d'erreur générique (String)
     */
    public static String simplify(String message) {
        if (message == null) return "Unknown error";
        return truncate(PACKAGE_PREFIX.matcher(message).replaceAll("$1"));
    }

    /**
     * Simplifie une erreur de base de données
     */
    public static String simplifyDbError(String message) {
        if (message == null) return "Unknown database error";

        for (var entry : DB_ERROR_PATTERNS.entrySet()) {
            if (entry.getKey().matcher(message).find()) {
                return entry.getValue();
            }
        }

        return truncate(message);
    }

    /**
     * Simplifie une erreur Kafka
     */
    public static String simplifyKafkaError(String message) {
        if (message == null) return "Unknown Kafka error";

        for (var entry : KAFKA_ERROR_PATTERNS.entrySet()) {
            if (entry.getKey().matcher(message).find()) {
                return entry.getValue();
            }
        }

        return truncate(message);
    }

    /**
     * Simplifie une erreur Kafka (Exception)
     */
    public static String simplifyKafkaError(Exception e) {
        if (e == null) return "Unknown Kafka error";
        return simplifyKafkaError(e.getMessage());
    }

    /**
     * Extrait le nom de l'entité d'une LazyInitializationException
     */
    public static String extractEntityFromLazyError(String message) {
        if (message == null) return "Unknown";

        var matcher = LAZY_ENTITY.matcher(message);
        if (matcher.matches()) {
            String fullClass = matcher.group(1);
            int lastDot = fullClass.lastIndexOf('.');
            return lastDot > 0 ? fullClass.substring(lastDot + 1) : fullClass;
        }

        return "Unknown entity";
    }

    /**
     * Tronque un message s'il est trop long
     */
    public static String truncate(String message) {
        if (message == null) return null;
        message = message.trim();
        if (message.length() <= MAX_LENGTH) return message;
        return message.substring(0, MAX_LENGTH) + "...";
    }

    /**
     * Tronque un message avec une longueur custom
     */
    public static String truncate(String message, int maxLength) {
        if (message == null) return null;
        message = message.trim();
        if (message.length() <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    }
}