-- Create database
CREATE DATABASE IF NOT EXISTS kafka_visualizer;
USE kafka_visualizer;

-- Disable foreign key checks to allow dropping tables
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if exist (order doesn't matter with FK checks disabled)
DROP TABLE IF EXISTS kafka_messages;
DROP TABLE IF EXISTS kafka_topics;
DROP TABLE IF EXISTS flow_diagrams;
DROP TABLE IF EXISTS kafka_connections;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Kafka Connection table
CREATE TABLE kafka_connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bootstrap_servers VARCHAR(500) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED',
    is_default BOOLEAN DEFAULT FALSE,
    security_protocol VARCHAR(100),
    sasl_mechanism VARCHAR(100),
    sasl_username VARCHAR(255),
    sasl_password VARCHAR(500),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    last_connected_at DATETIME(6),
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kafka Topic table
CREATE TABLE kafka_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    connection_id BIGINT NOT NULL,
    partitions INT,
    replication_factor SMALLINT,
    description VARCHAR(500),
    color VARCHAR(50),
    monitored BOOLEAN DEFAULT FALSE,
    message_count BIGINT DEFAULT 0,
    last_message_at DATETIME(6),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (connection_id) REFERENCES kafka_connections(id) ON DELETE CASCADE,
    UNIQUE KEY uk_topic_connection (connection_id, name),
    KEY idx_monitored (monitored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kafka Message table
CREATE TABLE kafka_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    direction VARCHAR(20) NOT NULL,
    message_key VARCHAR(500),
    message_value LONGTEXT NOT NULL,
    partition_number INT,
    offset_value BIGINT,
    headers VARCHAR(2000),
    status VARCHAR(50) DEFAULT 'RECEIVED',
    source_application VARCHAR(255),
    target_application VARCHAR(255),
    timestamp DATETIME(6),
    created_at DATETIME(6),
    FOREIGN KEY (topic_id) REFERENCES kafka_topics(id) ON DELETE CASCADE,
    KEY idx_message_topic (topic_id),
    KEY idx_message_timestamp (timestamp),
    KEY idx_message_key (message_key(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Flow Diagram table
CREATE TABLE flow_diagrams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    connection_id BIGINT NOT NULL,
    nodes_json LONGTEXT,
    edges_json LONGTEXT,
    layout_json LONGTEXT,
    auto_layout BOOLEAN DEFAULT FALSE,
    live_mode BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (connection_id) REFERENCES kafka_connections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
