package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.FlowDto;
import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<FlowDto.FlowDiagramResponse>>> getAllFlows() {
        return ResponseEntity.ok(ApiResponse.success(flowDiagramService.getAllFlows()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlowDto.FlowDiagramResponse>> getFlowById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(flowDiagramService.getFlowById(id)));
    }

    @GetMapping("/connection/{connectionId}")
    public ResponseEntity<ApiResponse<List<FlowDto.FlowDiagramResponse>>> getFlowsByConnection(@PathVariable Long connectionId) {
        return ResponseEntity.ok(ApiResponse.success(flowDiagramService.getFlowsByConnection(connectionId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FlowDto.FlowDiagramResponse>> createFlow(@RequestBody FlowDto.CreateFlowRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Flow diagram created successfully",
                flowDiagramService.createFlow(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlowDto.FlowDiagramResponse>> updateFlow(
            @PathVariable Long id,
            @RequestBody FlowDto.UpdateFlowRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Flow diagram updated successfully",
                flowDiagramService.updateFlow(id, request)
        ));
    }

    @PutMapping("/{id}/layout")
    public ResponseEntity<ApiResponse<FlowDto.FlowDiagramResponse>> updateFlowLayout(
            @PathVariable Long id,
            @RequestBody FlowDto.UpdateLayoutRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Flow layout updated successfully",
                flowDiagramService.updateFlowLayout(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlow(@PathVariable Long id) {
        flowDiagramService.deleteFlow(id);
        return ResponseEntity.ok(ApiResponse.success("Flow diagram deleted successfully", null));
    }
}
