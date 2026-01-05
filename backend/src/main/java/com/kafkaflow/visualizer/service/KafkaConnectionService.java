package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.exception.DuplicateResourceException;
import com.kafkaflow.visualizer.exception.KafkaConnectionException;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaConnection.ConnectionStatus;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConnectionService {

    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final Map<Long, AdminClient> adminClients = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public List<ConnectionResponse> getAllConnections() {
        return connectionRepository.findAllOrdered().stream()
                .map(this::toConnectionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConnectionResponse getConnection(Long id) {
        return connectionRepository.findById(id)
                .map(this::toConnectionResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", id));
    }

    @Transactional
    public ConnectionResponse createConnection(ConnectionRequest request) {
        if (connectionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Connection", "name", request.getName());
        }

        KafkaConnection connection = KafkaConnection.builder()
                .name(request.getName())
                .bootstrapServers(request.getBootstrapServers())
                .description(request.getDescription())
                .defaultConnection(request.isDefaultConnection())
                .securityProtocol(request.getSecurityProtocol())
                .saslMechanism(request.getSaslMechanism())
                .saslUsername(request.getSaslUsername())
                .saslPassword(request.getSaslPassword())
                .status(ConnectionStatus.DISCONNECTED)
                .build();

        if (request.isDefaultConnection()) {
            connectionRepository.findByDefaultConnectionTrue()
                    .ifPresent(c -> {
                        c.setDefaultConnection(false);
                        connectionRepository.save(c);
                    });
        }

        return toConnectionResponse(connectionRepository.save(connection));
    }

    @Transactional
    public ConnectionResponse updateConnection(Long id, ConnectionRequest request) {
        KafkaConnection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", id));

        connection.setName(request.getName());
        connection.setBootstrapServers(request.getBootstrapServers());
        connection.setDescription(request.getDescription());
        connection.setSecurityProtocol(request.getSecurityProtocol());
        connection.setSaslMechanism(request.getSaslMechanism());
        connection.setSaslUsername(request.getSaslUsername());
        
        if (request.getSaslPassword() != null && !request.getSaslPassword().isBlank()) {
            connection.setSaslPassword(request.getSaslPassword());
        }

        if (request.isDefaultConnection() && !connection.isDefaultConnection()) {
            connectionRepository.findByDefaultConnectionTrue()
                    .ifPresent(c -> {
                        c.setDefaultConnection(false);
                        connectionRepository.save(c);
                    });
            connection.setDefaultConnection(true);
        }

        return toConnectionResponse(connectionRepository.save(connection));
    }

    @Transactional
    public void deleteConnection(Long id) {
        closeAdminClient(id);
        connectionRepository.deleteById(id);
    }

    @Transactional
    public ConnectionResponse testConnection(Long id) {
        KafkaConnection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", id));

        try {
            connection.setStatus(ConnectionStatus.CONNECTING);
            connectionRepository.save(connection);

            AdminClient adminClient = getOrCreateAdminClient(connection);
            ListTopicsResult topics = adminClient.listTopics();
            Set<String> topicNames = topics.names().get(10, TimeUnit.SECONDS);

            connection.setStatus(ConnectionStatus.CONNECTED);
            connection.setLastConnectedAt(LocalDateTime.now());
            connectionRepository.save(connection);

            log.info("Successfully connected to Kafka: {}", connection.getName());

            // Auto-sync topics after successful connection
            autoSyncTopics(connection, topicNames);

        } catch (Exception e) {
            log.error("Failed to connect to Kafka: {}", connection.getName(), e);
            connection.setStatus(ConnectionStatus.ERROR);
            closeAdminClient(id);
        }

        return toConnectionResponse(connectionRepository.save(connection));
    }

    private void autoSyncTopics(KafkaConnection connection, Set<String> topicNames) {
        try {
            log.info("Auto-syncing {} topics for connection: {}", topicNames.size(), connection.getName());

            for (String topicName : topicNames) {
                // Skip internal Kafka topics
                if (topicName.startsWith("_") || topicName.startsWith("__")) {
                    continue;
                }

                if (!topicRepository.existsByConnectionIdAndName(connection.getId(), topicName)) {
                    KafkaTopic topic = KafkaTopic.builder()
                            .name(topicName)
                            .connection(connection)
                            .monitored(true)  // Auto-enable monitoring
                            .messageCount(0L)
                            .build();
                    topicRepository.save(topic);
                    log.info("Auto-created and monitoring topic: {}", topicName);
                } else {
                    // Update existing topics to monitored=true
                    topicRepository.findByConnectionIdAndName(connection.getId(), topicName)
                            .ifPresent(topic -> {
                                if (!topic.isMonitored()) {
                                    topic.setMonitored(true);
                                    topicRepository.save(topic);
                                    log.info("Enabled monitoring for existing topic: {}", topicName);
                                }
                            });
                }
            }
        } catch (Exception e) {
            log.error("Error auto-syncing topics for connection: {}", connection.getName(), e);
        }
    }

    @Transactional
    public List<String> discoverTopics(Long connectionId) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", connectionId));

        try {
            AdminClient adminClient = getOrCreateAdminClient(connection);
            Set<String> topicNames = adminClient.listTopics().names().get(10, TimeUnit.SECONDS);
            return new ArrayList<>(topicNames);
        } catch (Exception e) {
            log.error("Failed to discover topics for connection: {}", connectionId, e);
            throw new KafkaConnectionException("Failed to discover topics: " + e.getMessage(), e);
        }
    }

    private AdminClient getOrCreateAdminClient(KafkaConnection connection) {
        return adminClients.computeIfAbsent(connection.getId(), id -> {
            Properties props = new Properties();
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, connection.getBootstrapServers());
            props.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
            props.put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, 10000);

            if (connection.getSecurityProtocol() != null) {
                props.put("security.protocol", connection.getSecurityProtocol());
            }
            if (connection.getSaslMechanism() != null) {
                props.put("sasl.mechanism", connection.getSaslMechanism());
                props.put("sasl.jaas.config", String.format(
                        "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"%s\" password=\"%s\";",
                        connection.getSaslUsername(),
                        connection.getSaslPassword()
                ));
            }

            return AdminClient.create(props);
        });
    }

    private void closeAdminClient(Long connectionId) {
        AdminClient client = adminClients.remove(connectionId);
        if (client != null) {
            client.close();
        }
    }

    private ConnectionResponse toConnectionResponse(KafkaConnection connection) {
        return ConnectionResponse.builder()
                .id(connection.getId())
                .name(connection.getName())
                .bootstrapServers(connection.getBootstrapServers())
                .description(connection.getDescription())
                .status(connection.getStatus())
                .defaultConnection(connection.isDefaultConnection())
                .securityProtocol(connection.getSecurityProtocol())
                .createdAt(connection.getCreatedAt())
                .lastConnectedAt(connection.getLastConnectedAt())
                .topicCount(topicRepository.findByConnectionId(connection.getId()).size())
                .build();
    }
}
