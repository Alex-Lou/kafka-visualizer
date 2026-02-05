    package com.kafkaflow.visualizer.model;

    import jakarta.persistence.*;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.math.BigDecimal;
    import java.time.LocalDateTime;

    @Entity
    @Table(name = "kafka_messages_stats",
            uniqueConstraints = @UniqueConstraint(columnNames = {"topic_id", "hour_bucket"}))
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class KafkaMessageStats {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "topic_id", nullable = false)
        private Long topicId;

        @Column(name = "connection_id")
        private Long connectionId;

        @Column(name = "hour_bucket", nullable = false)
        private LocalDateTime hourBucket;

        @Column(name = "message_count")
        @Builder.Default
        private Integer messageCount = 0;

        @Column(name = "normal_count")
        @Builder.Default
        private Integer normalCount = 0;

        @Column(name = "error_count")
        @Builder.Default
        private Integer errorCount = 0;

        @Column(name = "warning_count")
        @Builder.Default
        private Integer warningCount = 0;

        @Column(name = "system_count")
        @Builder.Default
        private Integer systemCount = 0;

        @Column(name = "total_size_bytes")
        @Builder.Default
        private Long totalSizeBytes = 0L;

        @Column(name = "avg_size_bytes")
        @Builder.Default
        private Integer avgSizeBytes = 0;

        @Column(name = "min_size_bytes")
        @Builder.Default
        private Integer minSizeBytes = 0;

        @Column(name = "max_size_bytes")
        @Builder.Default
        private Integer maxSizeBytes = 0;

        @Column(name = "unique_keys_count")
        @Builder.Default
        private Integer uniqueKeysCount = 0;

        @Column(name = "unique_partitions_count")
        @Builder.Default
        private Integer uniquePartitionsCount = 0;

        @Column(name = "messages_per_minute", precision = 10, scale = 2)
        @Builder.Default
        private BigDecimal messagesPerMinute = BigDecimal.ZERO;

        @Column(name = "peak_messages_per_minute")
        @Builder.Default
        private Integer peakMessagesPerMinute = 0;

        @Column(name = "first_message_at")
        private LocalDateTime firstMessageAt;

        @Column(name = "last_message_at")
        private LocalDateTime lastMessageAt;

        @Column(name = "created_at")
        @Builder.Default
        private LocalDateTime createdAt = LocalDateTime.now();

        @Column(name = "updated_at")
        @Builder.Default
        private LocalDateTime updatedAt = LocalDateTime.now();

        public void incrementMessageCount(int size, KafkaMessageArchive.MessageType type) {
            this.messageCount++;
            this.totalSizeBytes += size;

            switch (type) {
                case NORMAL -> this.normalCount++;
                case ERROR -> this.errorCount++;
                case WARNING -> this.warningCount++;
                case SYSTEM -> this.systemCount++;
            }

            if (this.minSizeBytes == 0 || size < this.minSizeBytes) {
                this.minSizeBytes = size;
            }
            if (size > this.maxSizeBytes) {
                this.maxSizeBytes = size;
            }

            this.avgSizeBytes = (int) (this.totalSizeBytes / this.messageCount);
            this.updatedAt = LocalDateTime.now();
        }

        public void updateThroughput() {
            if (messageCount > 0) {
                this.messagesPerMinute = BigDecimal.valueOf(messageCount)
                        .divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
            }
        }

        public static KafkaMessageStats createForHour(Long topicId, Long connectionId, LocalDateTime hourBucket) {
            return KafkaMessageStats.builder()
                    .topicId(topicId)
                    .connectionId(connectionId)
                    .hourBucket(hourBucket)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }
    }