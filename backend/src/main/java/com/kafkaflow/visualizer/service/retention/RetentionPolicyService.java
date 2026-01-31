package com.kafkaflow.visualizer.service.retention;

import com.kafkaflow.visualizer.model.RetentionPolicy;
import com.kafkaflow.visualizer.repository.RetentionPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RetentionPolicyService {

    private final RetentionPolicyRepository policyRepository;

    public RetentionPolicy getEffectivePolicy(Long topicId, Long connectionId) {
        return policyRepository.findEffectivePolicy(topicId, connectionId)
                .orElse(createDefaultPolicy());
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
}