package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.model.FlowDiagram;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.repository.FlowDiagramRepository;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlowDiagramService {

    private final FlowDiagramRepository flowDiagramRepository;
    private final KafkaConnectionRepository connectionRepository;
    private final ObjectMapper objectMapper;

    public List<FlowDto.FlowDiagramResponse> getAllFlows() {
        return flowDiagramRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FlowDto.FlowDiagramResponse getFlowById(Long id) {
        FlowDiagram flow = flowDiagramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flow diagram not found: " + id));
        return toResponse(flow);
    }

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
        log.info("Created flow diagram: {} (id: {})", flow.getName(), flow.getId());
        return toResponse(flow);
    }

    @Transactional
    public FlowDto.FlowDiagramResponse updateFlow(Long id, FlowDto.UpdateFlowRequest request) {
        FlowDiagram flow = flowDiagramRepository.findById(id)
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
        log.info("Updated flow diagram: {} (id: {})", flow.getName(), flow.getId());
        return toResponse(flow);
    }

    @Transactional
    public FlowDto.FlowDiagramResponse updateFlowLayout(Long id, FlowDto.UpdateLayoutRequest request) {
        FlowDiagram flow = flowDiagramRepository.findById(id)
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
        log.info("Deleted flow diagram: {}", id);
    }

    private FlowDto.FlowDiagramResponse toResponse(FlowDiagram flow) {
        return FlowDto.FlowDiagramResponse.builder()
                .id(flow.getId())
                .name(flow.getName())
                .description(flow.getDescription())
                .connectionId(flow.getConnection() != null ? flow.getConnection().getId() : null)
                .connectionName(flow.getConnection() != null ? flow.getConnection().getName() : null)
                .nodes(fromJson(flow.getNodesJson(), Object.class))
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