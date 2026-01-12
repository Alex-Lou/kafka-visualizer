package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.KafkaTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KafkaTopicRepository extends JpaRepository<KafkaTopic, Long> {

    List<KafkaTopic> findByConnectionId(Long connectionId);

    Optional<KafkaTopic> findByConnectionIdAndName(Long connectionId, String name);

    List<KafkaTopic> findByMonitoredTrue();

    // Avec JOIN FETCH pour éviter LazyInitializationException
    @Query("SELECT t FROM KafkaTopic t LEFT JOIN FETCH t.connection WHERE t.monitored = true")
    List<KafkaTopic> findByMonitoredTrueWithConnection();

    // Avec JOIN FETCH pour un topic spécifique
    @Query("SELECT t FROM KafkaTopic t LEFT JOIN FETCH t.connection WHERE t.id = :id")
    Optional<KafkaTopic> findByIdWithConnection(@Param("id") Long id);

    @Query("SELECT t FROM KafkaTopic t WHERE t.connection.id = :connectionId ORDER BY t.messageCount DESC")
    List<KafkaTopic> findByConnectionIdOrderByMessageCountDesc(@Param("connectionId") Long connectionId);

    @Query("SELECT COUNT(t) FROM KafkaTopic t WHERE t.monitored = true")
    int countMonitoredTopics();

    @Query("SELECT t FROM KafkaTopic t ORDER BY t.messageCount DESC LIMIT :limit")
    List<KafkaTopic> findTopByMessageCount(@Param("limit") int limit);

    boolean existsByConnectionIdAndName(Long connectionId, String name);

    Optional<KafkaTopic> findByNameAndConnectionId(String name, Long connectionId);

    long countByConnectionId(Long connectionId);

    // ═══════════════════════════════════════════════════════════════════════
    // ORPHAN TOPICS - Topics sans connexion active (CONNECTED)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Trouve tous les topics dont la connexion n'est pas en statut CONNECTED
     * (connexion en erreur, déconnectée, en cours de connexion, ou supprimée)
     */
    @Query("SELECT t FROM KafkaTopic t LEFT JOIN FETCH t.connection c " +
            "WHERE c IS NULL OR c.status <> 'CONNECTED'")
    List<KafkaTopic> findOrphanTopics();

    /**
     * Compte le nombre de topics orphelins
     */
    @Query("SELECT COUNT(t) FROM KafkaTopic t LEFT JOIN t.connection c " +
            "WHERE c IS NULL OR c.status <> 'CONNECTED'")
    long countOrphanTopics();

    /**
     * Trouve les topics orphelins par liste d'IDs
     */
    @Query("SELECT t FROM KafkaTopic t LEFT JOIN FETCH t.connection c " +
            "WHERE t.id IN :ids AND (c IS NULL OR c.status <> 'CONNECTED')")
    List<KafkaTopic> findOrphanTopicsByIds(@Param("ids") List<Long> ids);
}
