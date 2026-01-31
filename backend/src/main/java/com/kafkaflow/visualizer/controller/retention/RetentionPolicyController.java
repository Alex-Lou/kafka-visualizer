package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.*;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.repository.*;
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
    private final RetentionPolicyRepository policyRepository;
    private final KafkaTopicRepository topicRepository;
    private final KafkaConnectionRepository connectionRepository;

    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getAllPolicies() {
        List<RetentionPolicy> policies = policyRepository.findByIsActiveTrueOrderByPriorityDesc();
        return ResponseEntity.ok(policies.stream()
                .map(this::toPolicyResponse)
                .toList());
    }

    @GetMapping("/global")
    public ResponseEntity<PolicyResponse> getGlobalPolicy() {
        RetentionPolicy policy = policyRepository.findGlobalPolicy()
                .orElseGet(this::createAndSaveDefaultGlobalPolicy);
        return ResponseEntity.ok(toPolicyResponse(policy));
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<PolicyResponse> getTopicPolicy(@PathVariable Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        RetentionPolicy policy = policyRepository
                .findEffectivePolicy(topicId, topic.getConnection().getId())
                .orElseGet(this::createAndSaveDefaultGlobalPolicy);

        return ResponseEntity.ok(toPolicyResponse(policy));
    }

    @PostMapping
    public ResponseEntity<PolicyResponse> createPolicy(@RequestBody CreatePolicyRequest request) {
        RetentionPolicy policy = RetentionPolicy.builder()
                .topicId(request.getTopicId())
                .connectionId(request.getConnectionId())
                .policyName(request.getPolicyName())
                .hotRetentionHours(request.getHotRetentionHours() != null ? request.getHotRetentionHours() : 168)
                .hotMaxMessages(request.getHotMaxMessages() != null ? request.getHotMaxMessages() : 100000)
                .hotMaxSizeMb(request.getHotMaxSizeMb() != null ? request.getHotMaxSizeMb() : 1000)
                .archiveEnabled(request.getArchiveEnabled() != null ? request.getArchiveEnabled() : true)
                .archiveRetentionDays(request.getArchiveRetentionDays() != null ? request.getArchiveRetentionDays() : 90)
                .archiveCompress(request.getArchiveCompress() != null ? request.getArchiveCompress() : true)
                .statsEnabled(request.getStatsEnabled() != null ? request.getStatsEnabled() : true)
                .statsRetentionDays(request.getStatsRetentionDays() != null ? request.getStatsRetentionDays() : 365)
                .autoPurgeEnabled(request.getAutoPurgeEnabled() != null ? request.getAutoPurgeEnabled() : true)
                .purgeBookmarked(request.getPurgeBookmarked() != null ? request.getPurgeBookmarked() : false)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .isActive(true)
                .build();

        return ResponseEntity.ok(toPolicyResponse(policyRepository.save(policy)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PolicyResponse> updatePolicy(
            @PathVariable Long id,
            @RequestBody UpdatePolicyRequest request) {

        RetentionPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", id));

        if (request.getPolicyName() != null) policy.setPolicyName(request.getPolicyName());
        if (request.getHotRetentionHours() != null) policy.setHotRetentionHours(request.getHotRetentionHours());
        if (request.getHotMaxMessages() != null) policy.setHotMaxMessages(request.getHotMaxMessages());
        if (request.getHotMaxSizeMb() != null) policy.setHotMaxSizeMb(request.getHotMaxSizeMb());
        if (request.getArchiveEnabled() != null) policy.setArchiveEnabled(request.getArchiveEnabled());
        if (request.getArchiveRetentionDays() != null) policy.setArchiveRetentionDays(request.getArchiveRetentionDays());
        if (request.getArchiveCompress() != null) policy.setArchiveCompress(request.getArchiveCompress());
        if (request.getStatsEnabled() != null) policy.setStatsEnabled(request.getStatsEnabled());
        if (request.getStatsRetentionDays() != null) policy.setStatsRetentionDays(request.getStatsRetentionDays());
        if (request.getAutoPurgeEnabled() != null) policy.setAutoPurgeEnabled(request.getAutoPurgeEnabled());
        if (request.getPurgeBookmarked() != null) policy.setPurgeBookmarked(request.getPurgeBookmarked());
        if (request.getPriority() != null) policy.setPriority(request.getPriority());
        if (request.getIsActive() != null) policy.setIsActive(request.getIsActive());

        return ResponseEntity.ok(toPolicyResponse(policyRepository.save(policy)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        if (!policyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Policy", id);
        }
        policyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private RetentionPolicy createAndSaveDefaultGlobalPolicy() {
        RetentionPolicy policy = policyService.createDefaultPolicy();
        policy.setPolicyName("Global Default Policy");
        policy.setHotMaxSizeMb(1000);
        policy.setArchiveCompress(true);
        policy.setPriority(0);
        policy.setIsActive(true);
        return policyRepository.save(policy);
    }

    private PolicyResponse toPolicyResponse(RetentionPolicy policy) {
        String topicName = null;
        String connectionName = null;

        if (policy.getTopicId() != null) {
            topicName = topicRepository.findById(policy.getTopicId())
                    .map(KafkaTopic::getName).orElse(null);
        }
        if (policy.getConnectionId() != null) {
            connectionName = connectionRepository.findById(policy.getConnectionId())
                    .map(KafkaConnection::getName).orElse(null);
        }

        return PolicyResponse.builder()
                .id(policy.getId())
                .topicId(policy.getTopicId())
                .topicName(topicName)
                .connectionId(policy.getConnectionId())
                .connectionName(connectionName)
                .policyName(policy.getPolicyName())
                .policyScope(policy.getPolicyScope())
                .hotRetentionHours(policy.getHotRetentionHours())
                .hotMaxMessages(policy.getHotMaxMessages())
                .hotMaxSizeMb(policy.getHotMaxSizeMb())
                .archiveEnabled(policy.getArchiveEnabled())
                .archiveRetentionDays(policy.getArchiveRetentionDays())
                .archiveCompress(policy.getArchiveCompress())
                .statsEnabled(policy.getStatsEnabled())
                .statsRetentionDays(policy.getStatsRetentionDays())
                .autoPurgeEnabled(policy.getAutoPurgeEnabled())
                .purgeBookmarked(policy.getPurgeBookmarked())
                .priority(policy.getPriority())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}