package com.kafkaflow.visualizer.service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class KafkaLogger {

    // ═══════════════════════════════════════════════════════════════
    // CONNECTION LOGS
    // ═══════════════════════════════════════════════════════════════

    public void logConnectionCreated(String name, String bootstrapServers) {
        log.info("✨ Connection created: {} ({})", name, bootstrapServers);
    }

    public void logConnectionUpdated(String name, String bootstrapServers) {
        log.info("🔄 Connection updated: {} ({})", name, bootstrapServers);
    }

    public void logConnectionDeleted(String name) {
        log.info("🗑️  Connection deleted: {}", name);
    }

    public void logConnectionTesting(String name, String bootstrapServers) {
        log.info("🔌 Testing connection: {} ({})", name, bootstrapServers);
    }

    public void logConnectionSuccess(String name, String bootstrapServers, int topicCount) {
        log.info("✅ Connection successful");
        log.info("   └─ Name: {}", name);
        log.info("   └─ Broker: {}", bootstrapServers);
        log.info("   └─ Topics found: {}", topicCount);
    }

    // ═══════════════════════════════════════════════════════════════
    // TOPIC SYNC LOGS
    // ═══════════════════════════════════════════════════════════════

    public void logTopicSyncStart(String connectionName, int topicCount) {
        log.debug("🔄 Auto-syncing {} topics with metadata for connection: {}", topicCount, connectionName);
    }

    public void logTopicSyncSuccess(String connectionName, int synced) {
        log.info("✅ Successfully synced {} topics with metadata for connection: {}", synced, connectionName);
    }

    public void logTopicSyncLegacy(String connectionName, int synced) {
        log.info("✅ Synced {} topics (legacy mode) for connection: {}", synced, connectionName);
    }

    public void logTopicSyncWarning(String connectionName, String reason) {
        log.warn("⚠️  Failed to describe topics, syncing without metadata: {}", reason);
    }

    public void logTopicCreated(String topicName, Integer partitions, Short replicationFactor) {
        log.debug("   ✨ Created: {} (partitions={}, rf={})", topicName, partitions, replicationFactor);
    }

    public void logTopicUpdated(String topicName, Integer partitions, Short replicationFactor) {
        log.debug("   🔄 Updated: {} (partitions={}, rf={})", topicName, partitions, replicationFactor);
    }

    public void logTopicMonitoringEnabled(String topicName) {
        log.debug("   🔄 Enabled monitoring: {}", topicName);
    }

    // ═══════════════════════════════════════════════════════════════
    // TOPIC DISCOVERY LOGS
    // ═══════════════════════════════════════════════════════════════

    public void logTopicDiscoveryStart(String connectionName) {
        log.info("🔍 Discovering topics on: {}", connectionName);
    }

    public void logTopicDiscoverySuccess(String connectionName, int topicCount) {
        log.info("✅ Discovered {} topics on {}", topicCount, connectionName);
    }

    // ═══════════════════════════════════════════════════════════════
    // METADATA REFRESH LOGS
    // ═══════════════════════════════════════════════════════════════

    public void logMetadataRefreshStart(String connectionName) {
        log.info("🔄 Refreshing topic metadata for: {}", connectionName);
    }

    public void logMetadataRefreshSuccess(String connectionName, int updated) {
        log.info("✅ Refreshed metadata for {} topics on {}", updated, connectionName);
    }

    public void logNoTopicsToRefresh(String connectionName) {
        log.info("ℹ️  No user topics to refresh for {}", connectionName);
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN CLIENT LOGS
    // ═══════════════════════════════════════════════════════════════

    public void logAdminClientCreated(String connectionName) {
        log.debug("🔧 Created AdminClient for: {}", connectionName);
    }

    public void logAdminClientClosed(Long connectionId) {
        log.debug("🔌 Closed AdminClient for connection ID: {}", connectionId);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST LOGS
    // ═══════════════════════════════════════════════════════════════

    public void logTestConnectionCreated() {
        log.info("🧪 Created test error connection");
    }
}