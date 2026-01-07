package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.RetentionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetentionPolicyRepository extends JpaRepository<RetentionPolicy, Long> {

    Optional<RetentionPolicy> findByTopicIdAndIsActiveTrue(Long topicId);

    Optional<RetentionPolicy> findByConnectionIdAndTopicIdIsNullAndIsActiveTrue(Long connectionId);

    @Query("SELECT p FROM RetentionPolicy p WHERE p.topicId IS NULL AND p.connectionId IS NULL AND p.isActive = true")
    Optional<RetentionPolicy> findGlobalPolicy();

    List<RetentionPolicy> findByIsActiveTrueOrderByPriorityDesc();

    List<RetentionPolicy> findByConnectionIdAndIsActiveTrueOrderByPriorityDesc(Long connectionId);

    @Query("SELECT p FROM RetentionPolicy p WHERE " +
            "(p.topicId = :topicId OR " +
            " (p.connectionId = :connectionId AND p.topicId IS NULL) OR " +
            " (p.topicId IS NULL AND p.connectionId IS NULL)) " +
            "AND p.isActive = true " +
            "ORDER BY p.priority DESC, " +
            "CASE WHEN p.topicId IS NOT NULL THEN 0 " +
            "     WHEN p.connectionId IS NOT NULL THEN 1 " +
            "     ELSE 2 END")
    List<RetentionPolicy> findEffectivePolicies(
            @Param("topicId") Long topicId,
            @Param("connectionId") Long connectionId);

    default Optional<RetentionPolicy> findEffectivePolicy(Long topicId, Long connectionId) {
        List<RetentionPolicy> policies = findEffectivePolicies(topicId, connectionId);
        return policies.isEmpty() ? Optional.empty() : Optional.of(policies.get(0));
    }

    boolean existsByTopicIdAndIsActiveTrue(Long topicId);

    boolean existsByConnectionIdAndTopicIdIsNullAndIsActiveTrue(Long connectionId);

    void deleteByTopicId(Long topicId);
}