package com.kafkaflow.visualizer.service.kafka;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Properties;

/**
 * Configuration et constantes pour les consumers Kafka
 */
public final class KafkaConsumerConfig {

    private KafkaConsumerConfig() {} // Pas d'instanciation

    // ═══════════════════════════════════════════════════════════════════════
    // TIMING
    // ═══════════════════════════════════════════════════════════════════════

    public static final Duration POLL_TIMEOUT = Duration.ofMillis(1000);
    public static final Duration THROUGHPUT_WINDOW = Duration.ofSeconds(60);
    public static final long RETRY_DELAY_MS = 5000;
    public static final int MAX_CONSECUTIVE_ERRORS = 5;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSUMER SETTINGS
    // ═══════════════════════════════════════════════════════════════════════

    public static final String AUTO_OFFSET_RESET = "latest";
    public static final int MAX_POLL_RECORDS = 100;
    public static final int AUTO_COMMIT_INTERVAL_MS = 1000;
    public static final int METADATA_MAX_AGE_MS = 60000;

    // ═══════════════════════════════════════════════════════════════════════
    // LOG MESSAGES
    // ═══════════════════════════════════════════════════════════════════════

    public static final class Log {
        public static final String MANAGER_INIT = "🎯 Kafka Consumer Manager initialized";
        public static final String MANAGER_SHUTDOWN = "🛑 Shutting down Kafka Consumer Manager...";
        public static final String SHUTDOWN_COMPLETE = "✓ Shutdown complete ({} consumers stopped)";

        public static final String NO_TOPICS = "📭 No monitored topics found";
        public static final String STARTING_CONSUMERS = "🔄 Starting {} consumer(s)...";
        public static final String ALL_STARTED = "✓ All {} consumers started";
        public static final String PARTIAL_START = "⚠️ Started {}/{} consumers ({} failed)";

        public static final String CONSUMER_STARTED = "✓ Started [{}]";
        public static final String CONSUMER_STOPPED = "🛑 Stopped [{}]";
        public static final String CONSUMER_START_FAILED = "❌ [{}] Start failed: {}";
        public static final String CONSUMER_NO_CONNECTION = "⚠️ [{}] No connection configured - skipping";

        public static final String ERROR_LEADER = "⏳ [{}] Leader not available - retrying...";
        public static final String ERROR_TIMEOUT = "⏳ [{}] Connection timeout - retrying...";
        public static final String ERROR_DISCONNECT = "🔌 [{}] Broker disconnected - retrying...";
        public static final String ERROR_AUTH = "🔒 [{}] Authentication failed";
        public static final String ERROR_GENERIC = "⚠️ [{}] Error ({}): {}";
        public static final String ERROR_TOO_MANY = "❌ [{}] Too many errors ({}) - stopping consumer";
        public static final String ERROR_PROCESSING = "⚠️ [{}] {} messages failed in batch";

        private Log() {}
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ERROR CATEGORIES
    // ═══════════════════════════════════════════════════════════════════════

    public enum ErrorCategory {
        LEADER_NOT_AVAILABLE,
        TIMEOUT,
        DISCONNECT,
        AUTH,
        UNKNOWN
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FACTORY METHOD
    // ═══════════════════════════════════════════════════════════════════════

    public static Properties buildConsumerProperties(String bootstrapServers, Long topicId) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-visualizer-" + topicId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, AUTO_OFFSET_RESET);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, String.valueOf(AUTO_COMMIT_INTERVAL_MS));
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, String.valueOf(MAX_POLL_RECORDS));
        props.put(ConsumerConfig.METADATA_MAX_AGE_CONFIG, String.valueOf(METADATA_MAX_AGE_MS));
        return props;
    }
}