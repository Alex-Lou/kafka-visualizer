package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.KafkaMessageArchive;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.ArchiveReason;
import com.kafkaflow.visualizer.model.KafkaMessageArchive.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KafkaMessageArchiveRepository extends JpaRepository<KafkaMessageArchive, Long> {

    // ═══════════════════════════════════════════════════════════════════════
    // BASIC QUERIES
    // ═══════════════════════════════════════════════════════════════════════

    Page<KafkaMessageArchive> findByTopicId(Long topicId, Pageable pageable);

    Page<KafkaMessageArchive> findByConnectionId(Long connectionId, Pageable pageable);

    List<KafkaMessageArchive> findByTopicIdOrderByOriginalTimestampDesc(Long topicId);

    // ═══════════════════════════════════════════════════════════════════════
    // QUERIES USED BY RETENTION CONTROLLER
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Find archives by topic ordered by timestamp (paginated)
     * Used by RetentionController.getArchives()
     */
    Page<KafkaMessageArchive> findByTopicIdOrderByOriginalTimestampDesc(Long topicId, Pageable pageable);

    /**
     * Search archives by topic and content
     * Used by RetentionController.getArchives()
     */
    @Query("SELECT a FROM KafkaMessageArchive a WHERE " +
            "a.topicId = :topicId AND (" +
            "LOWER(a.messageKey) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.messageValue) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<KafkaMessageArchive> searchByTopicAndContent(
            @Param("topicId") Long topicId,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Get archive stats by topic (count, size, oldest, newest)
     * Used by RetentionController.getTopicStorage()
     */
    @Query("SELECT a.topicId, a.topicName, COUNT(a), COALESCE(SUM(a.valueSize), 0), " +
            "MIN(a.originalTimestamp), MAX(a.originalTimestamp) " +
            "FROM KafkaMessageArchive a WHERE a.topicId = :topicId GROUP BY a.topicId, a.topicName")
    Object[] getArchiveStatsByTopicId(@Param("topicId") Long topicId);

    // ═══════════════════════════════════════════════════════════════════════
    // FILTERED SEARCH (for Archives Page)
    // ═══════════════════════════════════════════════════════════════════════

    @Query("SELECT a FROM KafkaMessageArchive a WHERE " +
            "(:topicId IS NULL OR a.topicId = :topicId) " +
            "AND (:connectionId IS NULL OR a.connectionId = :connectionId) " +
            "AND (:topicName IS NULL OR LOWER(a.topicName) LIKE LOWER(CONCAT('%', :topicName, '%'))) " +
            "AND (:messageKey IS NULL OR LOWER(a.messageKey) LIKE LOWER(CONCAT('%', :messageKey, '%'))) " +
            "AND (:valueContains IS NULL OR LOWER(a.messageValue) LIKE LOWER(CONCAT('%', :valueContains, '%'))) " +
            "AND (:fromDate IS NULL OR a.originalTimestamp >= :fromDate) " +
            "AND (:toDate IS NULL OR a.originalTimestamp <= :toDate) " +
            "AND (:messageType IS NULL OR a.messageType = :messageType) " +
            "AND (:archiveReason IS NULL OR a.archiveReason = :archiveReason) " +
            "AND (:contentType IS NULL OR a.contentType = :contentType)")
    Page<KafkaMessageArchive> findByFilters(
            @Param("topicId") Long topicId,
            @Param("connectionId") Long connectionId,
            @Param("topicName") String topicName,
            @Param("messageKey") String messageKey,
            @Param("valueContains") String valueContains,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("messageType") MessageType messageType,
            @Param("archiveReason") ArchiveReason archiveReason,
            @Param("contentType") String contentType,
            Pageable pageable
    );

    // ═══════════════════════════════════════════════════════════════════════
    // FULL TEXT SEARCH
    // ═══════════════════════════════════════════════════════════════════════

    @Query("SELECT a FROM KafkaMessageArchive a WHERE " +
            "LOWER(a.topicName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.messageKey) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.messageValue) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.connectionName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<KafkaMessageArchive> searchFullText(@Param("query") String query, Pageable pageable);

    // ═══════════════════════════════════════════════════════════════════════
    // COUNTS
    // ═══════════════════════════════════════════════════════════════════════

    long countByTopicId(Long topicId);

    long countByConnectionId(Long connectionId);

    @Query("SELECT COUNT(a) FROM KafkaMessageArchive a WHERE a.archivedAt >= :since")
    long countArchivedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM KafkaMessageArchive a")
    long countTotal();

    @Query("SELECT COALESCE(SUM(a.valueSize), 0) FROM KafkaMessageArchive a")
    long getTotalSize();

    @Query("SELECT COALESCE(SUM(a.valueSize), 0) FROM KafkaMessageArchive a WHERE a.topicId = :topicId")
    Long getTotalSizeByTopicId(@Param("topicId") Long topicId);

    // ═══════════════════════════════════════════════════════════════════════
    // STATS BY TOPIC
    // ═══════════════════════════════════════════════════════════════════════

    @Query("SELECT a.topicId, a.topicName, COUNT(a), COALESCE(SUM(a.valueSize), 0) " +
            "FROM KafkaMessageArchive a " +
            "GROUP BY a.topicId, a.topicName " +
            "ORDER BY COUNT(a) DESC")
    List<Object[]> getStatsByTopic();

    @Query("SELECT a.connectionId, a.connectionName, COUNT(a), COALESCE(SUM(a.valueSize), 0) " +
            "FROM KafkaMessageArchive a " +
            "GROUP BY a.connectionId, a.connectionName " +
            "ORDER BY COUNT(a) DESC")
    List<Object[]> getStatsByConnection();

    @Query("SELECT a.messageType, COUNT(a) FROM KafkaMessageArchive a GROUP BY a.messageType")
    List<Object[]> getCountByMessageType();

    @Query("SELECT a.archiveReason, COUNT(a) FROM KafkaMessageArchive a GROUP BY a.archiveReason")
    List<Object[]> getCountByArchiveReason();

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    @Modifying
    @Query("DELETE FROM KafkaMessageArchive a WHERE a.archivedAt < :before")
    int deleteExpiredArchives(@Param("before") LocalDateTime before);

    @Modifying
    @Query("DELETE FROM KafkaMessageArchive a WHERE a.topicId = :topicId")
    int deleteByTopicId(@Param("topicId") Long topicId);

    @Modifying
    @Query("DELETE FROM KafkaMessageArchive a WHERE a.connectionId = :connectionId")
    int deleteByConnectionId(@Param("connectionId") Long connectionId);

    @Modifying
    @Query("DELETE FROM KafkaMessageArchive a WHERE a.id IN :ids")
    int deleteByIds(@Param("ids") List<Long> ids);

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    @Query("SELECT a FROM KafkaMessageArchive a WHERE a.id IN :ids ORDER BY a.originalTimestamp DESC")
    List<KafkaMessageArchive> findByIdsOrdered(@Param("ids") List<Long> ids);

    @Query("SELECT a FROM KafkaMessageArchive a WHERE " +
            "(:topicId IS NULL OR a.topicId = :topicId) " +
            "AND (:fromDate IS NULL OR a.originalTimestamp >= :fromDate) " +
            "AND (:toDate IS NULL OR a.originalTimestamp <= :toDate) " +
            "ORDER BY a.originalTimestamp DESC")
    List<KafkaMessageArchive> findForExport(
            @Param("topicId") Long topicId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    // ═══════════════════════════════════════════════════════════════════════
    // DISTINCT VALUES (for filters)
    // ═══════════════════════════════════════════════════════════════════════

    @Query("SELECT DISTINCT a.topicName FROM KafkaMessageArchive a ORDER BY a.topicName")
    List<String> findDistinctTopicNames();

    @Query("SELECT DISTINCT a.connectionName FROM KafkaMessageArchive a ORDER BY a.connectionName")
    List<String> findDistinctConnectionNames();

    @Query("SELECT DISTINCT a.contentType FROM KafkaMessageArchive a WHERE a.contentType IS NOT NULL ORDER BY a.contentType")
    List<String> findDistinctContentTypes();
}