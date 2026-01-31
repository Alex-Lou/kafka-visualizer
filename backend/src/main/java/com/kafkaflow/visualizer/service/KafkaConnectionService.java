package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.exception.DuplicateResourceException;
import com.kafkaflow.visualizer.exception.KafkaConnectionException;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaConnection.ConnectionStatus;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConnectionService {

    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaLogger kafkaLogger;
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

        KafkaConnection connection = buildConnectionFromRequest(request, ConnectionStatus.DISCONNECTED);
        handleDefaultConnectionFlag(request.isDefaultConnection());

        kafkaLogger.logConnectionCreated(request.getName(), request.getBootstrapServers());
        return toConnectionResponse(connectionRepository.save(connection));
    }

    @Transactional
    public ConnectionResponse updateConnection(Long id, ConnectionRequest request) {
        KafkaConnection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", id));

        updateConnectionFields(connection, request); // On met à jour les champs

        handleDefaultConnectionFlag(request.isDefaultConnection());
        KafkaConnection savedConnection = connectionRepository.save(connection);

        // 2. À TOI : Appelle la méthode pour fermer l'AdminClient (utilise l'id)
        closeAdminClient(id);

        return toConnectionResponse(savedConnection);

    }

    @Transactional
    public void deleteConnection(Long id) {
        KafkaConnection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", id));


        kafkaLogger.logConnectionDeleted(connection.getName());
        connectionRepository.deleteById(id);
        closeAdminClient(id);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KAFKA OPERATIONS (Simplifiées)
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public List<String> discoverTopics(Long connectionId) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", connectionId));

        kafkaLogger.logTopicDiscoveryStart(connection.getName());

        try {
            AdminClient adminClient = getOrCreateAdminClient(connection);
            // On réduit le timeout pour ne pas bloquer l'UI trop longtemps
            Set<String> topicNames = adminClient.listTopics(new ListTopicsOptions().timeoutMs(5000))
                    .names()
                    .get(6, TimeUnit.SECONDS);

            kafkaLogger.logTopicDiscoverySuccess(connection.getName(), topicNames.size());
            return new ArrayList<>(topicNames);

        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            throw new KafkaConnectionException("Failed to discover topics", e);
        }
    }

    public void listerTopics(AdminClient adminClient) {
        try {
            // On imagine que cette ligne peut planter
            adminClient.listTopics().names().get();
        } catch (Exception e) {
            throw new KafkaConnectionException("Impossible de lister les topics sur le serveur.", e);
        }
    }

    @Transactional
    public void refreshTopicMetadata(Long connectionId) {
        KafkaConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", connectionId));

        kafkaLogger.logMetadataRefreshStart(connection.getName());

        try {
            AdminClient adminClient = getOrCreateAdminClient(connection);
            Set<String> allTopics = adminClient.listTopics(new ListTopicsOptions().timeoutMs(5000))
                    .names()
                    .get(6, TimeUnit.SECONDS);

            // Filtrer les topics internes (_)
            List<String> userTopics = allTopics.stream()
                    .filter(t -> !t.startsWith("_"))
                    .toList();

            if (userTopics.isEmpty()) {
                kafkaLogger.logNoTopicsToRefresh(connection.getName());
                return;
            }

            Map<String, TopicDescription> descriptions = adminClient.describeTopics(userTopics)
                    .allTopicNames()
                    .get(10, TimeUnit.SECONDS);

            updateTopicsInDb(connectionId, descriptions);
            kafkaLogger.logMetadataRefreshSuccess(connection.getName(), descriptions.size());

        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            // ✅ Propagation naturelle vers le GlobalHandler
            throw new KafkaConnectionException("Failed to refresh topic metadata", e);
        }
    }

    @Transactional
    public ConnectionResponse testConnection(Long id) {
        // Simple test de récupération, pourrait être enrichi par un vrai "ping" Kafka
        // Si tu veux tester la connexion réellement, appelle discoverTopics(id) ici et ignore le résultat.
        KafkaConnection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection", id));

        // Optionnel : Forcer un check réel
        // discoverTopics(id);

        return toConnectionResponse(connectionRepository.save(connection));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private void updateTopicsInDb(Long connectionId, Map<String, TopicDescription> descriptions) {
        for (Map.Entry<String, TopicDescription> entry : descriptions.entrySet()) {
            String topicName = entry.getKey();
            TopicDescription desc = entry.getValue();

            topicRepository.findByConnectionIdAndName(connectionId, topicName)
                    .ifPresent(topic -> {
                        topic.setPartitions(desc.partitions().size());
                        if (!desc.partitions().isEmpty()) {
                            topic.setReplicationFactor((short) desc.partitions().get(0).replicas().size());
                        }
                        topicRepository.save(topic);
                    });
        }
    }

    public AdminClient getOrCreateAdminClient(KafkaConnection connection) {
        return adminClients.computeIfAbsent(connection.getId(), id -> {
            Properties props = new Properties();
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, connection.getBootstrapServers());
            props.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000); // Fail fast
            props.put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, 5000);
            props.put(AdminClientConfig.RETRIES_CONFIG, 1);

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

            kafkaLogger.logAdminClientCreated(connection.getName());
            return AdminClient.create(props);
        });
    }

    private void closeAdminClient(Long connectionId) {
        AdminClient client = adminClients.remove(connectionId);
        if (client != null) {
            try {
                client.close();
            } catch (Exception e) {
                log.warn("Error closing AdminClient for connection {}: {}", connectionId, e.getMessage());
            }
            kafkaLogger.logAdminClientClosed(connectionId);
        }
    }

    private void handleDefaultConnectionFlag(boolean isDefault) {
        if (isDefault) {
            connectionRepository.findByDefaultConnectionTrue()
                    .ifPresent(c -> {
                        c.setDefaultConnection(false);
                        connectionRepository.save(c);
                    });
        }
    }

    // Helpers de construction pour alléger le code principal
    private KafkaConnection buildConnectionFromRequest(ConnectionRequest request, ConnectionStatus status) {
        return KafkaConnection.builder()
                .name(request.getName())
                .bootstrapServers(request.getBootstrapServers())
                .description(request.getDescription())
                .defaultConnection(request.isDefaultConnection())
                .securityProtocol(request.getSecurityProtocol())
                .saslMechanism(request.getSaslMechanism())
                .saslUsername(request.getSaslUsername())
                .saslPassword(request.getSaslPassword())
                .status(status)
                .build();
    }

    private void updateConnectionFields(KafkaConnection connection, ConnectionRequest request) {
        connection.setName(request.getName());
        connection.setBootstrapServers(request.getBootstrapServers());
        connection.setDescription(request.getDescription());
        connection.setSecurityProtocol(request.getSecurityProtocol());
        connection.setSaslMechanism(request.getSaslMechanism());
        connection.setSaslUsername(request.getSaslUsername());

        if (request.getSaslPassword() != null && !request.getSaslPassword().isBlank()) {
            connection.setSaslPassword(request.getSaslPassword());
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

    // Pour le debug seulement
    @Transactional
    public ConnectionResponse createErrorTestConnection() {
        return createConnection(ConnectionRequest.builder()
                .name("Test Error Connection " + System.currentTimeMillis())
                .bootstrapServers("localhost:9999") // Port invalide
                .build());
    }
}