package com.kafkaflow.visualizer.repository;

import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaConnection.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KafkaConnectionRepository extends JpaRepository<KafkaConnection, Long> {

    Optional<KafkaConnection> findByName(String name);

    List<KafkaConnection> findByStatus(ConnectionStatus status);

    Optional<KafkaConnection> findByDefaultConnectionTrue();

    @Query("SELECT c FROM KafkaConnection c ORDER BY c.defaultConnection DESC, c.name ASC")
    List<KafkaConnection> findAllOrdered();

    boolean existsByName(String name);

    @Query("SELECT COUNT(c) FROM KafkaConnection c WHERE c.status = 'CONNECTED'")
    int countActiveConnections();

}
