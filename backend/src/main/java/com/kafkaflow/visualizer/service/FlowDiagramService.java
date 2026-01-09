package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.model.FlowDiagram;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.FlowDiagramRepository;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.kafka.KafkaConsumerManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FlowDiagramService {

    private final FlowDiagramRepository flowDiagramRepository;
    private final KafkaConnectionRepository connectionRepository;
    private final KafkaTopicRepository topicRepository;
    private final ApplicationContext applicationContext;
    private final ObjectMapper objectMapper;

    public FlowDiagramService(
            FlowDiagramRepository flowDiagramRepository,
            KafkaConnectionRepository connectionRepository,
            KafkaTopicRepository topicRepository,
            ApplicationContext applicationContext,
            ObjectMapper objectMapper) {
        this.flowDiagramRepository = flowDiagramRepository;
        this.connectionRepository = connectionRepository;
        this.topicRepository = topicRepository;
        this.applicationContext = applicationContext;
        this.objectMapper = objectMapper;
    }

    // Lazy retrieval to avoid circular dependency
    private KafkaConsumerManager getConsumerManager() {
        return applicationContext.getBean(KafkaConsumerManager.class);
    }

    // ✅ Utilise findAllWithConnection pour éviter LazyInitializationException
    public List<FlowDto.FlowDiagramResponse> getAllFlows() {
        return flowDiagramRepository.findAllWithConnection().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ Utilise findByIdWithConnection pour éviter LazyInitializationException
    public FlowDto.FlowDiagramResponse getFlowById(Long id) {
        FlowDiagram flow = flowDiagramRepository.findByIdWithConnection(id)
                .orElseThrow(() -> new RuntimeException("Flow diagram not found: " + id));
        return toResponse(flow);
    }

    // ✅ Avec @Transactional pour garder la session ouverte
    @Transactional(readOnly = true)
    public List<FlowDto.FlowDiagramResponse> getFlowsByConnection(Long connectionId) {
        return flowDiagramRepository.findByConnectionId(connectionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FlowDto.FlowDiagramResponse createFlow(FlowDto.CreateFlowRequest request) {
        KafkaConnection connection = null;
        if (request.getConnectionId() != null) {
            connection = connectionRepository.findById(request.getConnectionId())
                    .orElseThrow(() -> new RuntimeException("Connection not found: " + request.getConnectionId()));
        }

        FlowDiagram flow = FlowDiagram.builder()
                .name(request.getName())
                .description(request.getDescription())
                .connection(connection)
                .nodesJson(toJson(request.getNodes()))
                .edgesJson(toJson(request.getEdges()))
                .layoutJson(toJson(request.getLayout()))
                .autoLayout(request.isAutoLayout())
                .liveMode(request.isLiveMode())
                .build();

        flow = flowDiagramRepository.save(flow);
        log.debug("Created flow diagram: {} (id: {})", flow.getName(), flow.getId());
        return toResponse(flow);
    }

    @Transactional
    public FlowDto.FlowDiagramResponse updateFlow(Long id, FlowDto.UpdateFlowRequest request) {
        FlowDiagram flow = flowDiagramRepository.findByIdWithConnection(id)
                .orElseThrow(() -> new RuntimeException("Flow diagram not found: " + id));

        if (request.getName() != null) {
            flow.setName(request.getName());
        }
        if (request.getDescription() != null) {
            flow.setDescription(request.getDescription());
        }
        if (request.getNodes() != null) {
            flow.setNodesJson(toJson(request.getNodes()));
        }
        if (request.getEdges() != null) {
            flow.setEdgesJson(toJson(request.getEdges()));
        }
        if (request.getLayout() != null) {
            flow.setLayoutJson(toJson(request.getLayout()));
        }
        if (request.getAutoLayout() != null) {
            flow.setAutoLayout(request.getAutoLayout());
        }
        if (request.getLiveMode() != null) {
            flow.setLiveMode(request.getLiveMode());
        }

        flow = flowDiagramRepository.save(flow);
        log.debug("Updated flow diagram: {} (id: {})", flow.getName(), flow.getId());
        return toResponse(flow);
    }

    @Transactional
    public FlowDto.FlowDiagramResponse updateFlowLayout(Long id, FlowDto.UpdateLayoutRequest request) {
        FlowDiagram flow = flowDiagramRepository.findByIdWithConnection(id)
                .orElseThrow(() -> new RuntimeException("Flow diagram not found: " + id));

        flow.setNodesJson(toJson(request.getNodes()));
        flow.setEdgesJson(toJson(request.getEdges()));

        flow = flowDiagramRepository.save(flow);
        log.debug("Updated flow layout: {}", flow.getId());
        return toResponse(flow);
    }

    @Transactional
    public void deleteFlow(Long id) {
        if (!flowDiagramRepository.existsById(id)) {
            throw new RuntimeException("Flow diagram not found: " + id);
        }
        flowDiagramRepository.deleteById(id);
        log.debug("Deleted flow diagram: {}", id);
    }

    private FlowDto.FlowDiagramResponse toResponse(FlowDiagram flow) {
        // ✅ Récupérer la connexion de manière sécurisée (déjà chargée via JOIN FETCH)
        KafkaConnection connection = flow.getConnection();

        List<Map<String, Object>> nodes = fromJson(flow.getNodesJson(), List.class);
        if (nodes != null && connection != null) {
            nodes.forEach(node -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) node.get("data");
                if (data != null) {
                    // Enrichir les nodes de type "topic"
                    if ("topic".equals(node.get("type")) || "topic".equals(data.get("type"))) {
                        String topicName = (String) data.get("label");
                        if (topicName != null) {
                            Optional<KafkaTopic> topicOpt = topicRepository.findByNameAndConnectionId(topicName, connection.getId());
                            topicOpt.ifPresent(topic -> {
                                data.put("messageCount", topic.getMessageCount() != null ? topic.getMessageCount() : 0L);
                                try {
                                    data.put("throughput", getConsumerManager().getTopicThroughput(topic.getId()));
                                } catch (Exception e) {
                                    data.put("throughput", 0.0);
                                }
                            });
                        }
                    }

                    // Enrichir les nodes de type "cluster" ou "application"
                    if ("cluster".equals(node.get("type")) || "application".equals(node.get("type")) ||
                            "cluster".equals(data.get("type")) || "application".equals(data.get("type"))) {
                        data.put("connectionId", connection.getId());
                        data.put("status", connection.getStatus() == KafkaConnection.ConnectionStatus.CONNECTED ? "active" : "inactive");
                        data.put("topicsCount", topicRepository.countByConnectionId(connection.getId()));
                    }
                }
            });
        }

        return FlowDto.FlowDiagramResponse.builder()
                .id(flow.getId())
                .name(flow.getName())
                .description(flow.getDescription())
                .connectionId(connection != null ? connection.getId() : null)
                .connectionName(connection != null ? connection.getName() : null)
                .nodes(nodes)
                .edges(fromJson(flow.getEdgesJson(), Object.class))
                .layout(fromJson(flow.getLayoutJson(), Object.class))
                .autoLayout(flow.isAutoLayout())
                .liveMode(flow.isLiveMode())
                .createdAt(flow.getCreatedAt())
                .updatedAt(flow.getUpdatedAt())
                .build();
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize to JSON", e);
            return null;
        }
    }

    private <T> T fromJson(String json, Class<T> clazz) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize from JSON", e);
            return null;
        }
    }
}