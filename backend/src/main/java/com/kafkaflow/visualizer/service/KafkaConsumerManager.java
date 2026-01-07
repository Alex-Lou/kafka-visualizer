package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerManager {

    private final KafkaTopicRepository topicRepository;
    private final KafkaTopicService topicService;
    private final com.kafkaflow.visualizer.websocket.WebSocketService webSocketService;

    private final Map<Long, KafkaConsumer<String, String>> activeConsumers = new ConcurrentHashMap<>();
    private final Map<Long, Thread> consumerThreads = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private volatile boolean running = true;

    @PostConstruct
    public void init() {
        log.info("Kafka Consumer Manager initialized");
        startMonitoredTopics();
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down Kafka Consumer Manager");
        running = false;
        activeConsumers.values().forEach(consumer -> {
            try {
                consumer.wakeup();
            } catch (Exception e) {
                log.warn("Error waking up consumer", e);
            }
        });
        executorService.shutdown();
    }

    @Scheduled(fixedDelay = 10000) // Check every 10 seconds
    public void checkAndUpdateConsumers() {
        try {
            List<KafkaTopic> monitoredTopics = topicRepository.findByMonitoredTrue();

            // Start consumers for new monitored topics
            for (KafkaTopic topic : monitoredTopics) {
                if (!activeConsumers.containsKey(topic.getId())) {
                    startConsumer(topic);
                }
            }

            // Stop consumers for topics that are no longer monitored
            Set<Long> monitoredIds = monitoredTopics.stream()
                    .map(KafkaTopic::getId)
                    .collect(Collectors.toSet());

            activeConsumers.keySet().stream()
                    .filter(id -> !monitoredIds.contains(id))
                    .collect(Collectors.toList())
                    .forEach(this::stopConsumer);

        } catch (Exception e) {
            log.error("Error checking and updating consumers", e);
        }
    }

    private void startMonitoredTopics() {
        List<KafkaTopic> monitoredTopics = topicRepository.findByMonitoredTrue();
        log.info("Starting consumers for {} monitored topics", monitoredTopics.size());
        monitoredTopics.forEach(this::startConsumer);
    }

    private void startConsumer(KafkaTopic topic) {
        if (activeConsumers.containsKey(topic.getId())) {
            log.debug("Consumer already running for topic: {}", topic.getName());
            return;
        }

        try {
            KafkaConnection connection = topic.getConnection();
            Properties props = new Properties();
            props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, connection.getBootstrapServers());
            props.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-visualizer-" + topic.getId());
            props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
            props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
            props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest"); // Changed to latest for real-time
            props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
            props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000");
            props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "100");

            KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
            consumer.subscribe(Collections.singletonList(topic.getName()));

            activeConsumers.put(topic.getId(), consumer);

            Thread consumerThread = new Thread(() -> consumeMessages(topic, consumer));
            consumerThread.setName("kafka-consumer-" + topic.getName());
            consumerThread.setDaemon(true);
            consumerThread.start();

            consumerThreads.put(topic.getId(), consumerThread);

            log.info("Started consumer for topic: {} (id: {})", topic.getName(), topic.getId());
        } catch (Exception e) {
            log.error("Failed to start consumer for topic: {}", topic.getName(), e);
        }
    }

    private void consumeMessages(KafkaTopic topic, KafkaConsumer<String, String> consumer) {
        log.info("Consumer thread started for topic: {}", topic.getName());

        while (running && activeConsumers.containsKey(topic.getId())) {
            try {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

                for (ConsumerRecord<String, String> record : records) {
                    try {
                        // Convert headers to map
                        Map<String, String> headers = new HashMap<>();
                        record.headers().forEach(header ->
                                headers.put(header.key(), new String(header.value()))
                        );

                        // Save message to database
                        var messageResponse = topicService.saveMessage(
                                topic.getId(),
                                KafkaMessage.MessageDirection.INBOUND,
                                record.key(),
                                record.value(),
                                record.partition(),
                                record.offset(),
                                headers
                        );

                        // Broadcast new message via WebSocket for real-time updates
                        try {
                            webSocketService.broadcastNewMessage(messageResponse);
                        } catch (Exception wsError) {
                            log.warn("Failed to broadcast message via WebSocket", wsError);
                        }

                        // ========================================================
                        // NEW: Broadcast topic update for real-time count updates
                        // ========================================================
                        try {
                            // Get updated topic from DB to get accurate count
                            KafkaTopic updatedTopic = topicRepository.findById(topic.getId()).orElse(null);
                            if (updatedTopic != null) {
                                webSocketService.broadcastTopicUpdate(
                                        updatedTopic.getId(),
                                        updatedTopic.getName(),
                                        updatedTopic.getMessageCount()
                                );
                            }
                        } catch (Exception topicError) {
                            log.warn("Failed to broadcast topic update via WebSocket", topicError);
                        }

                        log.debug("Saved and broadcasted message from topic {} partition {} offset {}",
                                topic.getName(), record.partition(), record.offset());

                    } catch (Exception e) {
                        log.error("Error saving message from topic: {}", topic.getName(), e);
                    }
                }

            } catch (org.apache.kafka.common.errors.WakeupException e) {
                log.info("Consumer wakeup for topic: {}", topic.getName());
                break;
            } catch (Exception e) {
                log.error("Error consuming messages from topic: {}", topic.getName(), e);
                try {
                    Thread.sleep(5000); // Wait before retrying
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        try {
            consumer.close();
            log.info("Consumer closed for topic: {}", topic.getName());
        } catch (Exception e) {
            log.error("Error closing consumer for topic: {}", topic.getName(), e);
        }
    }

    private void stopConsumer(Long topicId) {
        KafkaConsumer<String, String> consumer = activeConsumers.remove(topicId);
        if (consumer != null) {
            try {
                consumer.wakeup();
                log.info("Stopped consumer for topic id: {}", topicId);
            } catch (Exception e) {
                log.error("Error stopping consumer for topic id: {}", topicId, e);
            }
        }

        Thread thread = consumerThreads.remove(topicId);
        if (thread != null) {
            try {
                thread.interrupt();
            } catch (Exception e) {
                log.error("Error interrupting consumer thread for topic id: {}", topicId, e);
            }
        }
    }

    public int getActiveConsumerCount() {
        return activeConsumers.size();
    }

    public Map<Long, String> getConsumerStatus() {
        Map<Long, String> status = new HashMap<>();
        activeConsumers.forEach((topicId, consumer) -> {
            Thread thread = consumerThreads.get(topicId);
            status.put(topicId, thread != null && thread.isAlive() ? "RUNNING" : "STOPPED");
        });
        return status;
    }
}