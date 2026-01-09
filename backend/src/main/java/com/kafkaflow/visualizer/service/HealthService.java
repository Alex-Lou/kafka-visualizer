package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.HealthStatus;
import com.kafkaflow.visualizer.dto.KafkaDto.ComponentHealth;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaMessageRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class HealthService {

    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaMessageRepository messageRepository;
    private final ApplicationContext applicationContext;

    private final AtomicLong messageCounter = new AtomicLong(0);
    private final AtomicLong lastMessageCountSnapshot = new AtomicLong(0);
    private volatile LocalDateTime lastSnapshotTime = LocalDateTime.now();

    public HealthService(
            KafkaConnectionRepository connectionRepository,
            KafkaTopicRepository topicRepository,
            KafkaMessageRepository messageRepository,
            ApplicationContext applicationContext) {
        this.connectionRepository = connectionRepository;
        this.topicRepository = topicRepository;
        this.messageRepository = messageRepository;
        this.applicationContext = applicationContext;
    }

    // Lazy retrieval to avoid circular dependency
    private KafkaConsumerManager getConsumerManager() {
        return applicationContext.getBean(KafkaConsumerManager.class);
    }

    public HealthStatus getHealthStatus() {
        LocalDateTime now = LocalDateTime.now();

        // Component health checks
        ComponentHealth databaseHealth = checkDatabaseHealth();
        ComponentHealth kafkaHealth = checkKafkaHealth();
        ComponentHealth consumersHealth = checkConsumersHealth();

        // Overall status
        String overallStatus = determineOverallStatus(databaseHealth, kafkaHealth, consumersHealth);

        // Metrics
        Map<String, Object> metrics = buildMetrics();

        return HealthStatus.builder()
                .status(overallStatus)
                .timestamp(now)
                .uptime(getUptime())
                .version(getVersion())
                .database(databaseHealth)
                .kafka(kafkaHealth)
                .consumers(consumersHealth)
                .metrics(metrics)
                .build();
    }

    private ComponentHealth checkDatabaseHealth() {
        try {
            long connectionCount = connectionRepository.count();
            return ComponentHealth.builder()
                    .status("UP")
                    .message("Database connection OK")
                    .details(Map.of(
                            "connections", connectionCount,
                            "topics", topicRepository.count(),
                            "messages", messageRepository.count()
                    ))
                    .build();
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return ComponentHealth.builder()
                    .status("DOWN")
                    .message("Database connection failed: " + e.getMessage())
                    .build();
        }
    }

    private ComponentHealth checkKafkaHealth() {
        try {
            int activeConnections = connectionRepository.countActiveConnections();
            int totalConnections = (int) connectionRepository.count();

            String status = activeConnections > 0 ? "UP" : (totalConnections > 0 ? "DEGRADED" : "UP");
            String message = activeConnections > 0
                    ? activeConnections + " of " + totalConnections + " connections active"
                    : totalConnections > 0
                    ? "No active Kafka connections"
                    : "No Kafka connections configured";

            return ComponentHealth.builder()
                    .status(status)
                    .message(message)
                    .details(Map.of(
                            "totalConnections", totalConnections,
                            "activeConnections", activeConnections,
                            "connectionNames", connectionRepository.findAllOrdered().stream()
                                    .map(KafkaConnection::getName)
                                    .toList()
                    ))
                    .build();
        } catch (Exception e) {
            log.error("Kafka health check failed", e);
            return ComponentHealth.builder()
                    .status("DOWN")
                    .message("Kafka health check failed: " + e.getMessage())
                    .build();
        }
    }

    private ComponentHealth checkConsumersHealth() {
        try {
            KafkaConsumerManager consumerManager = getConsumerManager();
            int activeConsumers = consumerManager.getActiveConsumerCount();
            int monitoredTopics = topicRepository.countMonitoredTopics();

            String status;
            String message;

            if (monitoredTopics == 0) {
                status = "UP";
                message = "No topics configured for monitoring";
            } else if (activeConsumers == monitoredTopics) {
                status = "UP";
                message = activeConsumers + " consumers running";
            } else if (activeConsumers > 0) {
                status = "DEGRADED";
                message = activeConsumers + " of " + monitoredTopics + " consumers running";
            } else {
                status = "DOWN";
                message = "No active consumers";
            }

            Map<Long, String> consumerStatus = consumerManager.getConsumerStatus();

            return ComponentHealth.builder()
                    .status(status)
                    .message(message)
                    .details(Map.of(
                            "activeConsumers", activeConsumers,
                            "monitoredTopics", monitoredTopics,
                            "consumerStatus", consumerStatus
                    ))
                    .build();
        } catch (Exception e) {
            log.error("Consumer health check failed", e);
            return ComponentHealth.builder()
                    .status("DOWN")
                    .message("Consumer health check failed: " + e.getMessage())
                    .build();
        }
    }

    private String determineOverallStatus(ComponentHealth... components) {
        boolean hasDown = false;
        boolean hasDegraded = false;

        for (ComponentHealth component : components) {
            if ("DOWN".equals(component.getStatus())) {
                hasDown = true;
            } else if ("DEGRADED".equals(component.getStatus())) {
                hasDegraded = true;
            }
        }

        if (hasDown) return "DOWN";
        if (hasDegraded) return "DEGRADED";
        return "UP";
    }

    private Map<String, Object> buildMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        Duration timeDelta = Duration.between(lastSnapshotTime, now);
        long currentMessageCount = messageCounter.get();
        long previousMessageCount = lastMessageCountSnapshot.get();
        long messagesSinceLastSnapshot = currentMessageCount - previousMessageCount;

        double secondsDelta = timeDelta.toMillis() / 1000.0;
        double messagesPerSecond = (secondsDelta > 0) ? (double) messagesSinceLastSnapshot / secondsDelta : 0;

        // Update for next calculation
        this.lastSnapshotTime = now;
        this.lastMessageCountSnapshot.set(currentMessageCount);

        long messagesLastHour = messageRepository.countMessagesSince(now.minusHours(1));
        double messagesPerMinute = messagesLastHour / 60.0;

        metrics.put("messagesLast24h", messageRepository.countMessagesSince(now.minusHours(24)));
        metrics.put("messagesLastHour", messagesLastHour);
        metrics.put("messagesLastMinute", messagesSinceLastSnapshot);
        metrics.put("throughputPerSecond", Math.round(messagesPerSecond * 100.0) / 100.0);
        metrics.put("throughputPerMinute", Math.round(messagesPerMinute * 100.0) / 100.0);
        metrics.put("totalMessages", messageRepository.count());
        metrics.put("monitoredTopics", topicRepository.countMonitoredTopics());
        metrics.put("activeConsumers", getConsumerManager().getActiveConsumerCount());

        // JVM metrics
        Runtime runtime = Runtime.getRuntime();
        metrics.put("jvmMemoryUsed", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024));
        metrics.put("jvmMemoryMax", runtime.maxMemory() / (1024 * 1024));
        metrics.put("jvmMemoryFree", runtime.freeMemory() / (1024 * 1024));

        return metrics;
    }

    private String getUptime() {
        long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
        Duration duration = Duration.ofMillis(uptimeMillis);

        long days = duration.toDays();
        long hours = duration.toHoursPart();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();

        if (days > 0) {
            return String.format("%dd %dh %dm %ds", days, hours, minutes, seconds);
        } else if (hours > 0) {
            return String.format("%dh %dm %ds", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds);
        } else {
            return String.format("%ds", seconds);
        }
    }

    private String getVersion() {
        return "1.0.0-SNAPSHOT";
    }

    // Called by consumers to track message throughput
    public void recordMessage() {
        messageCounter.incrementAndGet();
    }

    public void recordMessages(int count) {
        messageCounter.addAndGet(count);
    }
}
