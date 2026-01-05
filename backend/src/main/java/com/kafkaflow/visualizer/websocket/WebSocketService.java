package com.kafkaflow.visualizer.websocket;

import com.kafkaflow.visualizer.dto.KafkaDto.MessageResponse;
import com.kafkaflow.visualizer.dto.KafkaDto.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewMessage(MessageResponse message) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("NEW_MESSAGE")
                .payload(message)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/messages", wsMessage);
        messagingTemplate.convertAndSend("/topic/messages/" + message.getTopicName(), wsMessage);
        
        log.debug("Broadcasted new message for topic: {}", message.getTopicName());
    }

    public void broadcastConnectionStatus(Long connectionId, String status) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("CONNECTION_STATUS")
                .payload(new ConnectionStatusPayload(connectionId, status))
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/connections", wsMessage);
    }

    public void broadcastTopicUpdate(Long topicId, String topicName, long messageCount) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("TOPIC_UPDATE")
                .payload(new TopicUpdatePayload(topicId, topicName, messageCount))
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/topics", wsMessage);
    }

    public void broadcastFlowUpdate(Long diagramId, Object flowData) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type("FLOW_UPDATE")
                .payload(flowData)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/flow/" + diagramId, wsMessage);
    }

    private record ConnectionStatusPayload(Long connectionId, String status) {}
    private record TopicUpdatePayload(Long topicId, String topicName, long messageCount) {}
}
