package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.dto.KafkaDto.ConnectionRequest;
import com.kafkaflow.visualizer.dto.KafkaDto.ConnectionResponse;
import com.kafkaflow.visualizer.exception.DuplicateResourceException;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class KafkaConnectionServiceTest {

    @Mock
    private KafkaConnectionRepository connectionRepository;

    @Mock
    private KafkaTopicRepository topicRepository;

    @InjectMocks
    private KafkaConnectionService connectionService;

    @Test
    void createConnection_ShouldCreateConnection_WhenNameIsUnique() {
        // Given
        ConnectionRequest request = ConnectionRequest.builder()
                .name("Production Cluster")
                .bootstrapServers("localhost:9092")
                .build();

        KafkaConnection savedConnection = KafkaConnection.builder()
                .id(1L)
                .name("Production Cluster")
                .bootstrapServers("localhost:9092")
                .build();

        given(connectionRepository.existsByName(request.getName())).willReturn(false);
        given(connectionRepository.save(any(KafkaConnection.class))).willReturn(savedConnection);

        // When
        ConnectionResponse response = connectionService.createConnection(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Production Cluster");
        then(connectionRepository).should().save(any(KafkaConnection.class));
    }

    @Test
    void createConnection_ShouldThrowException_WhenNameAlreadyExists() {
        // Given
        ConnectionRequest request = ConnectionRequest.builder()
                .name("Existing Cluster")
                .build();

        given(connectionRepository.existsByName(request.getName())).willReturn(true);

        // When / Then
        assertThatThrownBy(() -> connectionService.createConnection(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("name");
        
        then(connectionRepository).should(never()).save(any(KafkaConnection.class));
    }

    @Test
    void updateConnection_ShouldUpdateFields_WhenConnectionExists() {
        // Given
        Long id = 1L;
        ConnectionRequest request = ConnectionRequest.builder()
                .name("Updated Name")
                .bootstrapServers("new-host:9092")
                .build();

        KafkaConnection existingConnection = KafkaConnection.builder()
                .id(id)
                .name("Old Name")
                .bootstrapServers("old-host:9092")
                .build();

        given(connectionRepository.findById(id)).willReturn(Optional.of(existingConnection));
        given(connectionRepository.save(any(KafkaConnection.class))).willAnswer(invocation -> invocation.getArgument(0));

        // When
        ConnectionResponse response = connectionService.updateConnection(id, request);

        // Then
        assertThat(response.getName()).isEqualTo("Updated Name");
        assertThat(response.getBootstrapServers()).isEqualTo("new-host:9092");
    }

    @Test
    void getConnection_ShouldThrowException_WhenIdNotFound() {
        // Given
        Long id = 99L;
        given(connectionRepository.findById(id)).willReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> connectionService.getConnection(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
