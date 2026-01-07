package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "flow_diagrams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowDiagram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = true)
    private KafkaConnection connection;

    @Column(columnDefinition = "LONGTEXT")
    private String nodesJson;

    @Column(columnDefinition = "LONGTEXT")
    private String edgesJson;

    @Column(columnDefinition = "LONGTEXT")
    private String layoutJson;

    private boolean autoLayout;

    private boolean liveMode;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
