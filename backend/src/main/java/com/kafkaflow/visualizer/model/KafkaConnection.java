package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kafka_connections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KafkaConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String bootstrapServers;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectionStatus status;

    @Column(name = "is_default")
    private boolean defaultConnection;

    private String securityProtocol;

    private String saslMechanism;

    private String saslUsername;

    @Column(length = 500)
    private String saslPassword;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastConnectedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ConnectionStatus.DISCONNECTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ConnectionStatus {
        CONNECTED, DISCONNECTED, ERROR, CONNECTING
    }
}
