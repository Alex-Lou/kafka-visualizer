package com.kafkaflow.visualizer.service.kafka;

import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.HealthService;
import com.kafkaflow.visualizer.service.metrics.MetricsBroadcaster;
import com.kafkaflow.visualizer.service.metrics.ThroughputTracker;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import static com.kafkaflow.visualizer.service.kafka.KafkaConsumerConfig.Log;

/**
 * Gestionnaire principal des consumers Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerManager {

    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageProcessor messageProcessor;
    private final KafkaErrorHandler errorHandler;
    private final ThroughputTracker throughputTracker;
    private final MetricsBroadcaster metricsBroadcaster;
    private final HealthService healthService;

    private final Map<Long, ConsumerTask> activeTasks = new ConcurrentHashMap<>();
    private final Map<Long, Thread> consumerThreads = new ConcurrentHashMap<>();
    private final AtomicBoolean running = new AtomicBoolean(true);

    // ═══════════════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    @PostConstruct
    public void init() {
        log.info(Log.MANAGER_INIT);
        startMonitoredTopics();
        updateConsumerStatusCache(); // Initial sync
    }

    @PreDestroy
    public void shutdown() {
        log.info(Log.MANAGER_SHUTDOWN);
        running.set(false);

        int count = activeTasks.size();
        activeTasks.values().forEach(ConsumerTask::stop);
        activeTasks.clear();
        consumerThreads.clear();

        log.info(Log.SHUTDOWN_COMPLETE, count);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SCHEDULED TASKS
    // ═══════════════════════════════════════════════════════════════════════

    @Scheduled(fixedDelay = 10000)
    public void syncConsumers() {
        if (!running.get()) return;

        Set<Long> monitoredIds = getMonitoredTopicIds();

        // Démarrer les nouveaux
        topicRepository.findByMonitoredTrueWithConnection().stream()
                .filter(topic -> !activeTasks.containsKey(topic.getId()))
                .forEach(this::startConsumer);

        // Arrêter ceux qui ne sont plus monitorés
        activeTasks.keySet().stream()
                .filter(id -> !monitoredIds.contains(id))
                .toList()
                .forEach(this::stopConsumer);

        // Mettre à jour le cache
        updateConsumerStatusCache();
    }

    /**
     * Broadcast des métriques par topic (toutes les 3 secondes)
     */
    @Scheduled(fixedDelay = 3000)
    public void broadcastTopicMetrics() {
        if (!running.get()) return;
        activeTasks.keySet().forEach(metricsBroadcaster::broadcastTopicMetrics);
    }

    /**
     * Broadcast des métriques temps réel globales (toutes les secondes)
     * Plus fréquent pour un dashboard réactif
     */
    @Scheduled(fixedDelay = 1000)
    public void broadcastRealTimeMetrics() {
        if (!running.get()) return;
        metricsBroadcaster.broadcastRealTimeMetrics();
    }

    /**
     * Broadcast des stats complètes du dashboard (toutes les 5 secondes)
     * Moins fréquent car inclut des requêtes DB
     */
    @Scheduled(fixedDelay = 5000)
    public void broadcastDashboardStats() {
        if (!running.get()) return;
        updateConsumerStatusCache(); // Refresh avant broadcast
        metricsBroadcaster.broadcastDashboardMetrics();
    }

    /**
     * Nettoyage périodique des timestamps expirés (toutes les 30 secondes)
     */
    @Scheduled(fixedDelay = 30000)
    public void cleanupThroughputData() {
        if (!running.get()) return;
        throughputTracker.cleanupAll();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONSUMER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    private void startMonitoredTopics() {
        List<KafkaTopic> topics = topicRepository.findByMonitoredTrueWithConnection();

        if (topics.isEmpty()) {
            log.info(Log.NO_TOPICS);
            return;
        }

        log.info(Log.STARTING_CONSUMERS, topics.size());

        int success = 0, failed = 0;
        for (KafkaTopic topic : topics) {
            if (startConsumer(topic)) {
                success++;
            } else {
                failed++;
            }
        }

        if (failed == 0) {
            log.info(Log.ALL_STARTED, success);
        } else {
            log.warn(Log.PARTIAL_START, success, topics.size(), failed);
        }
    }

    private boolean startConsumer(KafkaTopic topic) {
        if (activeTasks.containsKey(topic.getId())) {
            return true;
        }

        KafkaConnection connection = topic.getConnection();
        if (connection == null) {
            log.warn(Log.CONSUMER_NO_CONNECTION, topic.getName());
            return false;
        }

        try {
            KafkaConsumer<String, String> consumer = createConsumer(connection, topic);
            throughputTracker.register(topic.getId());

            ConsumerTask task = new ConsumerTask(
                    topic.getId(),
                    topic.getName(),
                    consumer,
                    messageProcessor,
                    errorHandler,
                    healthService,
                    running
            );

            Thread thread = new Thread(task, "consumer-" + topic.getName());
            thread.setDaemon(true);
            thread.start();

            activeTasks.put(topic.getId(), task);
            consumerThreads.put(topic.getId(), thread);

            log.info(Log.CONSUMER_STARTED, topic.getName());
            updateConsumerStatusCache(); // Update cache after start
            return true;

        } catch (Exception e) {
            log.error(Log.CONSUMER_START_FAILED, topic.getName(), errorHandler.simplify(e));
            return false;
        }
    }

    private void stopConsumer(Long topicId) {
        ConsumerTask task = activeTasks.remove(topicId);
        Thread thread = consumerThreads.remove(topicId);
        throughputTracker.unregister(topicId);

        if (task != null) {
            task.stop();
        }

        if (thread != null) {
            thread.interrupt();
        }

        log.debug(Log.CONSUMER_STOPPED, topicId);
        updateConsumerStatusCache(); // Update cache after stop
    }

    private KafkaConsumer<String, String> createConsumer(KafkaConnection connection, KafkaTopic topic) {
        Properties props = KafkaConsumerConfig.buildConsumerProperties(
                connection.getBootstrapServers(),
                topic.getId()
        );
        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Collections.singletonList(topic.getName()));
        return consumer;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════

    public int getActiveConsumerCount() {
        return activeTasks.size();
    }

    public Map<Long, String> getConsumerStatus() {
        Map<Long, String> status = new HashMap<>();
        consumerThreads.forEach((topicId, thread) ->
                status.put(topicId, thread.isAlive() ? "RUNNING" : "STOPPED")
        );
        return status;
    }

    public double getTopicThroughput(Long topicId) {
        return throughputTracker.getThroughput(topicId);
    }

    public long getMessagesInWindow(Long topicId) {
        return throughputTracker.getMessagesInWindow(topicId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private Set<Long> getMonitoredTopicIds() {
        return topicRepository.findByMonitoredTrueWithConnection().stream()
                .map(KafkaTopic::getId)
                .collect(Collectors.toSet());
    }

    /**
     * Met à jour le cache des consumers dans MetricsBroadcaster
     * Évite la dépendance circulaire en passant les données par push
     */
    private void updateConsumerStatusCache() {
        metricsBroadcaster.updateConsumerStatus(getActiveConsumerCount(), getConsumerStatus());
    }
}