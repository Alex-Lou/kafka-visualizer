package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.FlowDiagram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlowDiagramRepository extends JpaRepository<FlowDiagram, Long> {

    List<FlowDiagram> findByConnectionId(Long connectionId);

    List<FlowDiagram> findByLiveModeTrue();

    List<FlowDiagram> findAllByOrderByUpdatedAtDesc();
}
