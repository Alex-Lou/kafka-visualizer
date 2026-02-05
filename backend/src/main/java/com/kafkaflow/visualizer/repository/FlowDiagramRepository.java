package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.FlowDiagram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlowDiagramRepository extends JpaRepository<FlowDiagram, Long> {

    List<FlowDiagram> findByConnectionId(Long connectionId);

    List<FlowDiagram> findByLiveModeTrue();

    List<FlowDiagram> findAllByOrderByUpdatedAtDesc();

    @Query("SELECT f FROM FlowDiagram f WHERE f.connection IS NULL ORDER BY f.updatedAt DESC")
    List<FlowDiagram> findGlobalFlows();

    @Query("SELECT f FROM FlowDiagram f LEFT JOIN FETCH f.connection ORDER BY f.updatedAt DESC")
    List<FlowDiagram> findAllWithConnection();

    @Query("SELECT f FROM FlowDiagram f LEFT JOIN FETCH f.connection WHERE f.id = :id")
    Optional<FlowDiagram> findByIdWithConnection(@Param("id") Long id);

    List<FlowDiagram> findByConnectionIdAndLiveModeTrue(Long connectionId);

    @Query("SELECT f FROM FlowDiagram f LEFT JOIN FETCH f.connection WHERE f.connection.id = :connectionId AND f.liveMode = true")
    List<FlowDiagram> findByConnectionIdAndLiveModeTrueWithConnection(@Param("connectionId") Long connectionId);
}