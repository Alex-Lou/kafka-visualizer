package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.KafkaMessageArchive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface KafkaMessageArchiveRepository extends JpaRepository<KafkaMessageArchive, Long> {

    Page<KafkaMessageArchive> findByTopicIdOrderByTimestampDesc(Long topicId, Pageable pageable);

    Page<KafkaMessageArchive> findByTopicIdAndTimestampBetweenOrderByTimestampDesc(
            Long topicId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<KafkaMessageArchive> findByConnectionIdOrderByTimestampDesc(Long connectionId, Pageable pageable);

    long countByTopicId(Long topicId);

    long countByConnectionId(Long connectionId);

    @Query("SELECT m FROM KafkaMessageArchive m WHERE m.topicId = :topicId " +
            "AND (m.msgKey LIKE %:search% OR m.msgValue LIKE %:search%) " +
            "ORDER BY m.timestamp DESC")
    Page<KafkaMessageArchive> searchByTopicAndContent(
            @Param("topicId") Long topicId,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT m FROM KafkaMessageArchive m WHERE m.archivedAt < :cutoff")
    List<KafkaMessageArchive> findExpiredArchives(@Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("DELETE FROM KafkaMessageArchive m WHERE m.archivedAt < :cutoff")
    int deleteExpiredArchives(@Param("cutoff") LocalDateTime cutoff);
    
    // Overloaded method for topic-specific deletion
    @Modifying
    @Query("DELETE FROM KafkaMessageArchive m WHERE m.topicId = :topicId AND m.archivedAt < :cutoff")
    int deleteExpiredArchives(@Param("topicId") Long topicId, @Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("DELETE FROM KafkaMessageArchive m WHERE m.topicId = :topicId")
    int deleteByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT COALESCE(SUM(m.valueSize), 0) FROM KafkaMessageArchive m WHERE m.topicId = :topicId")
    Long getTotalSizeByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT COALESCE(SUM(m.valueSize), 0) FROM KafkaMessageArchive m WHERE m.connectionId = :connectionId")
    Long getTotalSizeByConnectionId(@Param("connectionId") Long connectionId);

    @Query("SELECT new map(" +
            "COUNT(m) as count, " +
            "COALESCE(SUM(m.valueSize), 0) as totalSize, " +
            "MIN(m.timestamp) as oldestMessage, " +
            "MAX(m.timestamp) as newestMessage) " +
            "FROM KafkaMessageArchive m WHERE m.topicId = :topicId")
    Map<String, Object> getArchiveStatsByTopicId(@Param("topicId") Long topicId);
}