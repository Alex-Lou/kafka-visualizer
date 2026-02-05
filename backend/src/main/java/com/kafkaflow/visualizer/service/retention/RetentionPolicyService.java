package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.dto.RetentionDto.CreatePolicyRequest;
import com.kafkaflow.visualizer.dto.RetentionDto.UpdatePolicyRequest;
import com.kafkaflow.visualizer.exception.ResourceNotFoundException;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.model.RetentionPolicy;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import com.kafkaflow.visualizer.repository.RetentionPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RetentionPolicyService {

    private final RetentionPolicyRepository policyRepository;
    private final KafkaTopicRepository topicRepository;

    public List<RetentionPolicy> getAllActivePolicies() {
        return policyRepository.findByIsActiveTrueOrderByPriorityDesc();
    }

    public RetentionPolicy getEffectivePolicy(Long topicId, Long connectionId) {
        return policyRepository.findEffectivePolicy(topicId, connectionId)
                .orElse(createDefaultPolicy()); // Retourne un objet transient (non sauvegardé) par défaut
    }

    @Transactional
    public RetentionPolicy getGlobalPolicy() {
        return policyRepository.findGlobalPolicy()
                .orElseGet(this::createAndSaveDefaultGlobalPolicy);
    }

    @Transactional
    public RetentionPolicy getTopicPolicy(Long topicId) {
        KafkaTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", topicId));

        return policyRepository
                .findEffectivePolicy(topicId, topic.getConnection().getId())
                .orElseGet(this::createAndSaveDefaultGlobalPolicy);
    }

    @Transactional
    public RetentionPolicy createPolicy(CreatePolicyRequest request) {
        RetentionPolicy policy = RetentionPolicy.builder()
                .topicId(request.getTopicId())
                .connectionId(request.getConnectionId())
                .policyName(request.getPolicyName())
                // Valeurs par défaut gérées ici (Business Logic)
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

        return policyRepository.save(policy);
    }

    @Transactional
    public RetentionPolicy updatePolicy(Long id, UpdatePolicyRequest request) {
        RetentionPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", id));

        // Patching logic moved from Controller
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

        return policyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        if (!policyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Policy", id);
        }
        policyRepository.deleteById(id);
    }

    public RetentionPolicy createDefaultPolicy() {
        return RetentionPolicy.builder()
                .hotRetentionHours(168)
                .hotMaxMessages(100000)
                .archiveEnabled(true)
                .archiveRetentionDays(90)
                .statsEnabled(true)
                .statsRetentionDays(365)
                .autoPurgeEnabled(true)
                .purgeBookmarked(false)
                .build();
    }

    private RetentionPolicy createAndSaveDefaultGlobalPolicy() {
        RetentionPolicy policy = createDefaultPolicy();
        policy.setPolicyName("Global Default Policy");
        policy.setHotMaxSizeMb(1000);
        policy.setArchiveCompress(true);
        policy.setPriority(0);
        policy.setIsActive(true);
        return policyRepository.save(policy);
    }
}