package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.service.FlowDiagramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flows")
@RequiredArgsConstructor
public class FlowDiagramController {

    private final FlowDiagramService flowDiagramService;

    @GetMapping
    public ResponseEntity<List<FlowDto.FlowDiagramResponse>> getAllFlows() {
        return ResponseEntity.ok(flowDiagramService.getAllFlows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlowDto.FlowDiagramResponse> getFlowById(@PathVariable Long id) {
        return ResponseEntity.ok(flowDiagramService.getFlowById(id));
    }

    @GetMapping("/connection/{connectionId}")
    public ResponseEntity<List<FlowDto.FlowDiagramResponse>> getFlowsByConnection(@PathVariable Long connectionId) {
        return ResponseEntity.ok(flowDiagramService.getFlowsByConnection(connectionId));
    }

    @PostMapping
    public ResponseEntity<FlowDto.FlowDiagramResponse> createFlow(@RequestBody FlowDto.CreateFlowRequest request) {
        return ResponseEntity.ok(flowDiagramService.createFlow(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlowDto.FlowDiagramResponse> updateFlow(
            @PathVariable Long id,
            @RequestBody FlowDto.UpdateFlowRequest request) {
        return ResponseEntity.ok(flowDiagramService.updateFlow(id, request));
    }

    @PutMapping("/{id}/layout")
    public ResponseEntity<FlowDto.FlowDiagramResponse> updateFlowLayout(
            @PathVariable Long id,
            @RequestBody FlowDto.UpdateLayoutRequest request) {
        return ResponseEntity.ok(flowDiagramService.updateFlowLayout(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlow(@PathVariable Long id) {
        flowDiagramService.deleteFlow(id);
        return ResponseEntity.noContent().build();
    }
}