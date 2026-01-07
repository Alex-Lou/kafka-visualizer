package com.kafkaflow.visualizer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "retention_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetentionPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic_id")
    private Long topicId;

    @Column(name = "connection_id")
    private Long connectionId;

    @Column(name = "policy_name", length = 100)
    private String policyName;

    @Column(name = "hot_retention_hours")
    @Builder.Default
    private Integer hotRetentionHours = 168;

    @Column(name = "hot_max_messages")
    @Builder.Default
    private Integer hotMaxMessages = 100000;

    @Column(name = "hot_max_size_mb")
    @Builder.Default
    private Integer hotMaxSizeMb = 1000;

    @Column(name = "archive_enabled")
    @Builder.Default
    private Boolean archiveEnabled = true;

    @Column(name = "archive_retention_days")
    @Builder.Default
    private Integer archiveRetentionDays = 90;

    @Column(name = "archive_compress")
    @Builder.Default
    private Boolean archiveCompress = true;

    @Column(name = "stats_enabled")
    @Builder.Default
    private Boolean statsEnabled = true;

    @Column(name = "stats_retention_days")
    @Builder.Default
    private Integer statsRetentionDays = 365;

    @Column(name = "auto_purge_enabled")
    @Builder.Default
    private Boolean autoPurgeEnabled = true;

    @Column(name = "purge_bookmarked")
    @Builder.Default
    private Boolean purgeBookmarked = false;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public boolean isGlobalPolicy() {
        return topicId == null && connectionId == null;
    }

    public boolean isConnectionPolicy() {
        return topicId == null && connectionId != null;
    }

    public boolean isTopicPolicy() {
        return topicId != null;
    }

    public String getPolicyScope() {
        if (isTopicPolicy()) return "TOPIC";
        if (isConnectionPolicy()) return "CONNECTION";
        return "GLOBAL";
    }

    public LocalDateTime getHotCutoffTime() {
        return LocalDateTime.now().minusHours(hotRetentionHours);
    }

    public LocalDateTime getArchiveCutoffTime() {
        return LocalDateTime.now().minusDays(archiveRetentionDays);
    }

    public LocalDateTime getStatsCutoffTime() {
        return LocalDateTime.now().minusDays(statsRetentionDays);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}