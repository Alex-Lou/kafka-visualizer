package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.KafkaDto.ApiResponse; // Import de ta classe wrapper
import com.kafkaflow.visualizer.dto.RetentionDto.CreatePolicyRequest;
import com.kafkaflow.visualizer.dto.RetentionDto.PolicyResponse;
import com.kafkaflow.visualizer.dto.RetentionDto.UpdatePolicyRequest;
import com.kafkaflow.visualizer.mapper.RetentionDtoMapper;
import com.kafkaflow.visualizer.service.retention.RetentionPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retention/policies")
@RequiredArgsConstructor
public class RetentionPolicyController {

    private final RetentionPolicyService policyService;
    private final RetentionDtoMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PolicyResponse>>> getAllPolicies() {
        List<PolicyResponse> policies = policyService.getAllActivePolicies().stream()
                .map(mapper::toPolicyResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(policies));
    }

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<PolicyResponse>> getGlobalPolicy() {
        return ResponseEntity.ok(ApiResponse.success(
                mapper.toPolicyResponse(policyService.getGlobalPolicy())
        ));
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<PolicyResponse>> getTopicPolicy(@PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(
                mapper.toPolicyResponse(policyService.getTopicPolicy(topicId))
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PolicyResponse>> createPolicy(@RequestBody CreatePolicyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Policy created successfully",
                mapper.toPolicyResponse(policyService.createPolicy(request))
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyResponse>> updatePolicy(
            @PathVariable Long id,
            @RequestBody UpdatePolicyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Policy updated successfully",
                mapper.toPolicyResponse(policyService.updatePolicy(id, request))
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Policy deleted successfully", null));
    }
}