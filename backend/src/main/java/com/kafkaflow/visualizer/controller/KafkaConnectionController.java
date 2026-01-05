package com.kafkaflow.visualizer.controller;

import com.kafkaflow.visualizer.dto.KafkaDto.*;
import com.kafkaflow.visualizer.service.KafkaConnectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class KafkaConnectionController {

    private final KafkaConnectionService connectionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConnectionResponse>>> getAllConnections() {
        return ResponseEntity.ok(ApiResponse.success(connectionService.getAllConnections()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectionResponse>> getConnection(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(connectionService.getConnection(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConnectionResponse>> createConnection(
            @Valid @RequestBody ConnectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Connection created successfully",
                connectionService.createConnection(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectionResponse>> updateConnection(
            @PathVariable Long id,
            @Valid @RequestBody ConnectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Connection updated successfully",
                connectionService.updateConnection(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConnection(@PathVariable Long id) {
        connectionService.deleteConnection(id);
        return ResponseEntity.ok(ApiResponse.success("Connection deleted successfully", null));
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<ApiResponse<ConnectionResponse>> testConnection(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Connection test completed",
                connectionService.testConnection(id)
        ));
    }

    @GetMapping("/{id}/topics/discover")
    public ResponseEntity<ApiResponse<List<String>>> discoverTopics(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(connectionService.discoverTopics(id)));
    }
}
