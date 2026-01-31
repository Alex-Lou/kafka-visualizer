package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupLogger {

    private final Environment env;
    private final KafkaTopicRepository topicRepository;
    private final KafkaConnectionRepository connectionRepository;
    private final KafkaConsumerManager consumerManager;


    @EventListener(ApplicationReadyEvent.class)
    public void logStartup(ApplicationReadyEvent event) {
        Instant startTime = Instant.ofEpochMilli(event.getTimestamp());
        Duration startupTime = Duration.between(startTime, Instant.now());

        try {
            String protocol = "http";
            String serverPort = env.getProperty("server.port", "8080");
            String contextPath = env.getProperty("server.servlet.context-path", "");
            String hostAddress = InetAddress.getLocalHost().getHostAddress();

            int activeConsumers = consumerManager.getActiveConsumerCount();
            long monitoredTopics = topicRepository.countMonitoredTopics();
            long totalTopics = topicRepository.count();
            long activeConnections = connectionRepository.countActiveConnections();

            log.info("\n" +
                            "╔══════════════════════════════════════════════════════════════════════╗\n" +
                            "║                   🚀 APPLICATION STARTED SUCCESSFULLY                ║\n" +
                            "╚══════════════════════════════════════════════════════════════════════╝\n" +
                            "\n" +
                            "  📊 System Status:\n" +
                            "     ✓ Startup Time ................... {}\n" +
                            "     ✓ Server Port .................... {}\n" +
                            "     ✓ Profile ........................ {}\n" +
                            "\n" +
                            "  🔗 Kafka Status:\n" +
                            "     ✓ Active Connections ............. {}\n" +
                            "     ✓ Total Topics ................... {}\n" +
                            "     ✓ Monitored Topics ............... {}\n" +
                            "     ✓ Active Consumers ............... {}\n" +
                            "\n" +
                            "  🌐 Access URLs:\n" +
                            "     • Local:   {}://localhost:{}{}\n" +
                            "     • Network: {}://{}:{}{}\n" +
                            "     • Actuator: {}://localhost:{}/actuator\n" +
                            "\n" +
                            "╚══════════════════════════════════════════════════════════════════════╝\n",
                    formatDuration(startupTime),
                    serverPort,
                    env.getProperty("spring.profiles.active", "default"),
                    activeConnections,
                    totalTopics,
                    monitoredTopics,
                    activeConsumers,
                    protocol, serverPort, contextPath,
                    protocol, hostAddress, serverPort, contextPath,
                    protocol, serverPort
            );

        } catch (Exception e) {
            log.error("Failed to log startup information", e);
        }
    }

    private String formatDuration(Duration duration) {
        long seconds = duration.getSeconds();
        if (seconds < 60) {
            return String.format("%d.%03ds", seconds, duration.toMillisPart());
        }
        long minutes = seconds / 60;
        seconds = seconds % 60;
        return String.format("%dm %ds", minutes, seconds);
    }
}
