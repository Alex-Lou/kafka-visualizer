package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafkaflow.visualizer.dto.FlowDto.CreateFlowRequest;
import com.kafkaflow.visualizer.dto.FlowDto.FlowDiagramResponse;
import com.kafkaflow.visualizer.dto.FlowDto.UpdateFlowRequest;
import com.kafkaflow.visualizer.model.FlowDiagram;
import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.repository.FlowDiagramRepository;
import com.kafkaflow.visualizer.repository.KafkaConnectionRepository;
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

@ExtendWith(MockitoExtension.class)
class FlowDiagramServiceTest {

    @Mock
    private FlowDiagramRepository flowDiagramRepository;
    @Mock
    private KafkaConnectionRepository connectionRepository;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private FlowDiagramService flowDiagramService;

    @Test
    void createFlow_ShouldSaveAndReturnFlow() {
        // Given
        CreateFlowRequest request = CreateFlowRequest.builder()
                .name("My Flow")
                .connectionId(1L)
                .build();

        KafkaConnection connection = KafkaConnection.builder().id(1L).build();
        given(connectionRepository.findById(1L)).willReturn(Optional.of(connection));

        given(flowDiagramRepository.save(any(FlowDiagram.class))).willAnswer(inv -> {
            FlowDiagram f = inv.getArgument(0);
            f.setId(10L);
            return f;
        });

        // When
        FlowDiagramResponse response = flowDiagramService.createFlow(request);

        // Then
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getName()).isEqualTo("My Flow");
        then(flowDiagramRepository).should().save(any(FlowDiagram.class));
    }

    @Test
    void updateFlow_ShouldUpdateFields() {
        // Given
        Long flowId = 1L;
        FlowDiagram existingFlow = FlowDiagram.builder().id(flowId).name("Old Name").build();
        UpdateFlowRequest request = UpdateFlowRequest.builder().name("New Name").build();

        given(flowDiagramRepository.findById(flowId)).willReturn(Optional.of(existingFlow));
        given(flowDiagramRepository.save(any(FlowDiagram.class))).willAnswer(inv -> inv.getArgument(0));

        // When
        FlowDiagramResponse response = flowDiagramService.updateFlow(flowId, request);

        // Then
        assertThat(response.getName()).isEqualTo("New Name");
    }

    @Test
    void deleteFlow_ShouldThrowIfNotFound() {
        // Given
        Long flowId = 99L;
        given(flowDiagramRepository.existsById(flowId)).willReturn(false);

        // When / Then
        assertThatThrownBy(() -> flowDiagramService.deleteFlow(flowId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }
}
