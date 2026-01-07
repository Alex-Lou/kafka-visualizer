package com.kafkaflow.visualizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class FlowDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowDiagramResponse {
        private Long id;
        private String name;
        private String description;
        private Long connectionId;
        private String connectionName;
        private Object nodes;
        private Object edges;
        private Object layout;
        private boolean autoLayout;
        private boolean liveMode;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateFlowRequest {
        private String name;
        private String description;
        private Long connectionId;
        private Object nodes;
        private Object edges;
        private Object layout;
        private boolean autoLayout;
        private boolean liveMode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateFlowRequest {
        private String name;
        private String description;
        private Object nodes;
        private Object edges;
        private Object layout;
        private Boolean autoLayout;
        private Boolean liveMode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateLayoutRequest {
        private Object nodes;
        private Object edges;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowNode {
        private String id;
        private String type;
        private FlowPosition position;
        private FlowNodeData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowPosition {
        private double x;
        private double y;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowNodeData {
        private String label;
        private String sublabel;
        private Long topicId;
        private String topicName;
        private Long messageCount;
        private Double throughput;
        private String status;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowEdge {
        private String id;
        private String source;
        private String target;
        private String label;
        private boolean animated;
        private FlowEdgeStyle style;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlowEdgeStyle {
        private String stroke;
        private Integer strokeWidth;
    }
}