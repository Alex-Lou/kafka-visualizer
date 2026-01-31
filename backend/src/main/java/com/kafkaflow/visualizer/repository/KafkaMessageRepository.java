package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.KafkaMessage;
import com.kafkaflow.visualizer.model.KafkaMessage.MessageDirection;
import com.kafkaflow.visualizer.model.KafkaMessage.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface KafkaMessageRepository extends JpaRepository<KafkaMessage, Long> {

    Page<KafkaMessage> findByTopicId(Long topicId, Pageable pageable);

    Page<KafkaMessage> findByTopicIdAndKeyContaining(Long topicId, String key, Pageable pageable);

    @Query("SELECT m FROM KafkaMessage m WHERE m.topic.id = :topicId " +
            "AND (:key IS NULL OR m.key LIKE %:key%) " +
            "AND (:valueContains IS NULL OR m.value LIKE %:valueContains%) " +
            "AND (:fromDate IS NULL OR m.timestamp >= :fromDate) " +
            "AND (:toDate IS NULL OR m.timestamp <= :toDate) " +
            "AND (:direction IS NULL OR m.direction = :direction) " +
            "AND (:status IS NULL OR m.status = :status) " +
            "AND (:partition IS NULL OR m.partition = :partition)")
    Page<KafkaMessage> findByFilters(
            @Param("topicId") Long topicId,
            @Param("key") String key,
            @Param("valueContains") String valueContains,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("direction") MessageDirection direction,
            @Param("status") MessageStatus status,
            @Param("partition") Integer partition,
            Pageable pageable
    );

    @Query("SELECT COUNT(m) FROM KafkaMessage m WHERE m.timestamp >= :since")
    long countMessagesSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(m) FROM KafkaMessage m WHERE m.topic.id = :topicId")
    long countByTopicId(@Param("topicId") Long topicId);

    List<KafkaMessage> findTop100ByTopicIdOrderByTimestampDesc(Long topicId);

    @Query("SELECT FUNCTION('HOUR', m.timestamp) as hour, COUNT(m) as count " +
            "FROM KafkaMessage m WHERE m.timestamp >= :since " +
            "GROUP BY FUNCTION('HOUR', m.timestamp) " +
            "ORDER BY hour")
    List<Object[]> getMessageTrendsByHour(@Param("since") LocalDateTime since);

    @Modifying
    @Query("DELETE FROM KafkaMessage m WHERE m.timestamp < :before")
    int deleteOlderThan(@Param("before") LocalDateTime before);

    @Modifying
    @Transactional
    @Query("DELETE FROM KafkaMessage m WHERE m.topic.id = :topicId")
    int deleteByTopicId(@Param("topicId") Long topicId);

    long countByTopicIdAndTimestampBetween(Long topicId, LocalDateTime start, LocalDateTime end);

    List<KafkaMessage> findByTopicIdAndTimestampBetween(Long topicId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT m FROM KafkaMessage m WHERE m.topic.id = :topicId AND m.timestamp < :before AND m.isBookmarked = false")
    List<KafkaMessage> findMessagesOlderThan(@Param("topicId") Long topicId, @Param("before") LocalDateTime before, Pageable pageable);

    long countByTopicIdAndTimestampAfter(Long topicId, LocalDateTime timestamp);

    long countByTopicIdAndMessageTypeAndTimestampAfter(
            Long topicId,
            KafkaMessage.MessageType messageType,
            LocalDateTime timestamp
    );

    @Query("SELECT COALESCE(SUM(m.valueSize), 0) FROM KafkaMessage m WHERE m.topic.id = :topicId")
    Long getTotalSizeByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT MIN(m.timestamp) FROM KafkaMessage m WHERE m.topic.id = :topicId")
    LocalDateTime findOldestTimestampByTopicId(@Param("topicId") Long topicId);

    Optional<KafkaMessage> findFirstByTopicIdOrderByTimestampDesc(Long topicId);

    @Modifying
    @Query("DELETE FROM KafkaMessage m WHERE m.topic.id = :topicId")
    void deleteAllByTopicId(@Param("topicId") Long topicId);

    // =========================================================================
    // RETENTION SERVICES - Messages à archiver
    // =========================================================================

    @Query("SELECT m FROM KafkaMessage m WHERE m.topic.id = :topicId " +
            "AND m.timestamp < :cutoff " +
            "AND (:includeBookmarked = true OR m.isBookmarked = false) " +
            "ORDER BY m.timestamp ASC")
    List<KafkaMessage> findMessagesToArchive(
            @Param("topicId") Long topicId,
            @Param("cutoff") LocalDateTime cutoff,
            @Param("includeBookmarked") boolean includeBookmarked,
            Pageable pageable);

    @Query("SELECT m FROM KafkaMessage m WHERE m.topic.id = :topicId " +
            "AND m.timestamp < :before " +
            "ORDER BY m.timestamp ASC")
    List<KafkaMessage> findByTopicIdAndTimestampBefore(
            @Param("topicId") Long topicId,
            @Param("before") LocalDateTime before,
            Pageable pageable);
}