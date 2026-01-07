package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.KafkaMessageStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface KafkaMessageStatsRepository extends JpaRepository<KafkaMessageStats, Long> {

    Optional<KafkaMessageStats> findByTopicIdAndHourBucket(Long topicId, LocalDateTime hourBucket);

    List<KafkaMessageStats> findByTopicIdAndHourBucketBetweenOrderByHourBucketAsc(
            Long topicId, LocalDateTime start, LocalDateTime end);

    List<KafkaMessageStats> findByConnectionIdAndHourBucketBetweenOrderByHourBucketAsc(
            Long connectionId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT new map(" +
            "SUM(s.messageCount) as totalMessages, " +
            "SUM(s.errorCount) as totalErrors, " +
            "SUM(s.warningCount) as totalWarnings, " +
            "SUM(s.totalSizeBytes) as totalSize, " +
            "AVG(s.messagesPerMinute) as avgThroughput, " +
            "MAX(s.peakMessagesPerMinute) as peakThroughput) " +
            "FROM KafkaMessageStats s " +
            "WHERE s.topicId = :topicId AND s.hourBucket >= :since")
    Map<String, Object> getAggregatedStatsByTopicId(
            @Param("topicId") Long topicId,
            @Param("since") LocalDateTime since);

    @Query("SELECT new map(" +
            "SUM(s.messageCount) as totalMessages, " +
            "SUM(s.errorCount) as totalErrors, " +
            "SUM(s.warningCount) as totalWarnings, " +
            "SUM(s.totalSizeBytes) as totalSize, " +
            "AVG(s.messagesPerMinute) as avgThroughput) " +
            "FROM KafkaMessageStats s " +
            "WHERE s.hourBucket >= :since")
    Map<String, Object> getGlobalAggregatedStats(@Param("since") LocalDateTime since);

    @Query("SELECT s FROM KafkaMessageStats s " +
            "WHERE s.topicId = :topicId AND s.hourBucket >= :since " +
            "ORDER BY s.hourBucket ASC")
    List<KafkaMessageStats> getHourlyStats(
            @Param("topicId") Long topicId,
            @Param("since") LocalDateTime since);

    @Query("SELECT s.topicId, SUM(s.messageCount) as total " +
            "FROM KafkaMessageStats s " +
            "WHERE s.hourBucket >= :since " +
            "GROUP BY s.topicId " +
            "ORDER BY total DESC")
    List<Object[]> getTopTopicsByMessageCount(@Param("since") LocalDateTime since);

    @Query("SELECT s.topicId, SUM(s.errorCount) as total " +
            "FROM KafkaMessageStats s " +
            "WHERE s.hourBucket >= :since AND s.errorCount > 0 " +
            "GROUP BY s.topicId " +
            "ORDER BY total DESC")
    List<Object[]> getTopTopicsByErrorCount(@Param("since") LocalDateTime since);

    @Modifying
    @Query("DELETE FROM KafkaMessageStats s WHERE s.hourBucket < :cutoff")
    int deleteOldStats(@Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("DELETE FROM KafkaMessageStats s WHERE s.topicId = :topicId")
    int deleteByTopicId(@Param("topicId") Long topicId);

    boolean existsByTopicIdAndHourBucket(Long topicId, LocalDateTime hourBucket);
}