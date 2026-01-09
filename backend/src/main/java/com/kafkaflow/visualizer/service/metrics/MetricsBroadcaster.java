package com.kafkaflow.visualizer.service.metrics;

import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.model.FlowDiagram;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.FlowDiagramRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.service.FlowDiagramService;
import com.kafkaflow.visualizer.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Broadcast des métriques via WebSocket
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MetricsBroadcaster {

    private final WebSocketService webSocketService;
    private final KafkaTopicRepository topicRepository;
    private final FlowDiagramRepository flowDiagramRepository;
    private final FlowDiagramService flowDiagramService;
    private final ThroughputTracker throughputTracker;

    /**
     * Broadcast les métriques complètes d'un topic
     */
    public void broadcastTopicMetrics(Long topicId) {
        findTopicWithConnection(topicId).ifPresent(topic -> {
            double throughput = throughputTracker.getThroughput(topicId);
            long messagesLastMinute = throughputTracker.getMessagesInWindow(topicId);
            long messageCount = Optional.ofNullable(topic.getMessageCount()).orElse(0L);

            var metrics = new WebSocketService.TopicMetricsPayload(
                    topicId,
                    topic.getName(),
                    messageCount,
                    roundTwoDecimals(throughput),
                    roundTwoDecimals(throughput * 60),
                    messagesLastMinute,
                    topic.getLastMessageAt(),
                    true
            );

            webSocketService.broadcastTopicMetrics(metrics);
            webSocketService.broadcastTopicUpdate(topicId, topic.getName(), messageCount, roundTwoDecimals(throughput));
        });
    }

    /**
     * Broadcast une mise à jour de topic (après réception de messages)
     */
    public void broadcastTopicUpdate(Long topicId) {
        findTopicWithConnection(topicId).ifPresent(topic -> {
            double throughput = throughputTracker.getThroughput(topicId);
            long messageCount = Optional.ofNullable(topic.getMessageCount()).orElse(0L);
            webSocketService.broadcastTopicUpdate(topicId, topic.getName(), messageCount, throughput);
        });
    }

    /**
     * Broadcast les mises à jour de flows liés à un topic
     */
    public void broadcastFlowUpdates(Long topicId) {
        findTopicWithConnection(topicId)
                .filter(topic -> topic.getConnection() != null)
                .ifPresent(topic -> {
                    Long connectionId = topic.getConnection().getId();
                    List<FlowDiagram> liveFlows = flowDiagramRepository.findByConnectionIdAndLiveModeTrueWithConnection(connectionId);

                    liveFlows.forEach(flow -> broadcastFlowUpdate(flow.getId()));
                });
    }

    /**
     * Broadcast un flow spécifique
     */
    public void broadcastFlowUpdate(Long flowId) {
        try {
            FlowDto.FlowDiagramResponse flowData = flowDiagramService.getFlowById(flowId);
            webSocketService.broadcastFlowUpdate(flowId, flowData);
        } catch (Exception e) {
            log.trace("Flow broadcast skipped [{}]: {}", flowId, e.getMessage());
        }
    }

    private Optional<KafkaTopic> findTopicWithConnection(Long topicId) {
        return topicRepository.findByIdWithConnection(topicId);
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}