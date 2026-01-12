package com.kafkaflow.visualizer.service.metrics;

import com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Tracking du throughput par topic et global (messages/seconde)
 * Utilise des fenêtres glissantes en mémoire pour le temps réel.
 */
@Component
public class ThroughputTracker {

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTES - Fenêtres de temps
    // ═══════════════════════════════════════════════════════════════════════

    /** Fenêtre pour le calcul du throughput (défaut: 60s) */
    private static final Duration THROUGHPUT_WINDOW = KafkaConsumerConfig.THROUGHPUT_WINDOW;

    /** Fenêtre pour "last minute" - 60 secondes */
    private static final Duration LAST_MINUTE_WINDOW = Duration.ofSeconds(60);

    /** Fenêtre pour "last hour" en mémoire - 1 heure */
    private static final Duration LAST_HOUR_WINDOW = Duration.ofHours(1);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    /** Timestamps par topic pour fenêtre courte (throughput + last minute) */
    private final Map<Long, Deque<Instant>> topicTimestamps = new ConcurrentHashMap<>();

    /** Timestamps par topic pour fenêtre longue (last hour) - optionnel */
    private final Map<Long, Deque<Instant>> topicTimestampsHourly = new ConcurrentHashMap<>();

    /** Activer ou non le tracking horaire en mémoire (consomme plus de RAM) */
    private final boolean hourlyTrackingEnabled;

    public ThroughputTracker() {
        // Par défaut, on active le tracking horaire
        // À désactiver si trop de messages (> 100k/heure)
        this.hourlyTrackingEnabled = true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENREGISTREMENT DES MESSAGES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Enregistre N messages reçus maintenant pour un topic
     */
    public void recordMessages(Long topicId, int count) {
        if (count <= 0) return;

        Instant now = Instant.now();

        // Fenêtre courte (throughput + last minute)
        Deque<Instant> timestamps = topicTimestamps.computeIfAbsent(
                topicId, k -> new ConcurrentLinkedDeque<>()
        );
        for (int i = 0; i < count; i++) {
            timestamps.addLast(now);
        }

        // Fenêtre longue (last hour) - si activé
        if (hourlyTrackingEnabled) {
            Deque<Instant> hourlyTimestamps = topicTimestampsHourly.computeIfAbsent(
                    topicId, k -> new ConcurrentLinkedDeque<>()
            );
            for (int i = 0; i < count; i++) {
                hourlyTimestamps.addLast(now);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTRIQUES PAR TOPIC
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calcule le throughput en messages/seconde pour un topic
     */
    public double getThroughput(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null || timestamps.isEmpty()) {
            return 0.0;
        }

        cleanOldTimestamps(timestamps, THROUGHPUT_WINDOW);

        if (timestamps.isEmpty()) {
            return 0.0;
        }

        return (double) timestamps.size() / THROUGHPUT_WINDOW.getSeconds();
    }

    /**
     * Nombre de messages dans la fenêtre de temps (défaut ~60s)
     */
    public long getMessagesInWindow(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps, THROUGHPUT_WINDOW);
        return timestamps.size();
    }

    /**
     * Nombre de messages dans la dernière minute
     */
    public long getMessagesLastMinute(Long topicId) {
        Deque<Instant> timestamps = topicTimestamps.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps, LAST_MINUTE_WINDOW);
        return countInWindow(timestamps, LAST_MINUTE_WINDOW);
    }

    /**
     * Nombre de messages dans la dernière heure (depuis mémoire)
     */
    public long getMessagesLastHour(Long topicId) {
        if (!hourlyTrackingEnabled) {
            return -1; // Indique qu'il faut utiliser la DB
        }

        Deque<Instant> timestamps = topicTimestampsHourly.get(topicId);
        if (timestamps == null) {
            return 0;
        }
        cleanOldTimestamps(timestamps, LAST_HOUR_WINDOW);
        return timestamps.size();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTRIQUES GLOBALES (agrégées tous topics)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Throughput global en messages/seconde (tous topics confondus)
     */
    public double getGlobalThroughput() {
        return topicTimestamps.keySet().stream()
                .mapToDouble(this::getThroughput)
                .sum();
    }

    /**
     * Messages globaux dans la dernière minute
     */
    public long getGlobalMessagesLastMinute() {
        return topicTimestamps.keySet().stream()
                .mapToLong(this::getMessagesLastMinute)
                .sum();
    }

    /**
     * Messages globaux dans la dernière heure (depuis mémoire)
     * Retourne -1 si le tracking horaire est désactivé
     */
    public long getGlobalMessagesLastHour() {
        if (!hourlyTrackingEnabled) {
            return -1;
        }
        return topicTimestampsHourly.keySet().stream()
                .mapToLong(this::getMessagesLastHour)
                .sum();
    }

    /**
     * Retourne les IDs des topics actuellement trackés
     */
    public Set<Long> getTrackedTopicIds() {
        return topicTimestamps.keySet();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GESTION DU CYCLE DE VIE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Initialise le tracking pour un topic
     */
    public void register(Long topicId) {
        topicTimestamps.putIfAbsent(topicId, new ConcurrentLinkedDeque<>());
        if (hourlyTrackingEnabled) {
            topicTimestampsHourly.putIfAbsent(topicId, new ConcurrentLinkedDeque<>());
        }
    }

    /**
     * Supprime le tracking pour un topic
     */
    public void unregister(Long topicId) {
        topicTimestamps.remove(topicId);
        topicTimestampsHourly.remove(topicId);
    }

    /**
     * Nettoie tous les timestamps expirés (appelé périodiquement si besoin)
     */
    public void cleanupAll() {
        topicTimestamps.values().forEach(ts -> cleanOldTimestamps(ts, THROUGHPUT_WINDOW));
        if (hourlyTrackingEnabled) {
            topicTimestampsHourly.values().forEach(ts -> cleanOldTimestamps(ts, LAST_HOUR_WINDOW));
        }
    }

    /**
     * @return true si le tracking horaire en mémoire est activé
     */
    public boolean isHourlyTrackingEnabled() {
        return hourlyTrackingEnabled;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Nettoie les timestamps plus vieux que la fenêtre donnée
     */
    private void cleanOldTimestamps(Deque<Instant> timestamps, Duration window) {
        Instant cutoff = Instant.now().minus(window);
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }
    }

    /**
     * Compte les éléments dans une fenêtre de temps spécifique
     */
    private long countInWindow(Deque<Instant> timestamps, Duration window) {
        Instant cutoff = Instant.now().minus(window);
        return timestamps.stream()
                .filter(ts -> ts.isAfter(cutoff))
                .count();
    }
}