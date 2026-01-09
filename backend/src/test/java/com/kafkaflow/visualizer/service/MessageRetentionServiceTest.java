package com.kafkaflow.visualizer.service;

import com.kafkaflow.visualizer.model.*;
import com.kafkaflow.visualizer.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class MessageRetentionServiceTest {

    @Mock
    private KafkaMessageRepository messageRepository;
    @Mock
    private KafkaMessageArchiveRepository archiveRepository;
    @Mock
    private RetentionPolicyRepository policyRepository;
    @Mock
    private RetentionJobLogRepository jobLogRepository;
    @Mock
    private KafkaTopicRepository topicRepository;
    @Mock
    private KafkaMessageStatsRepository statsRepository;

    @InjectMocks
    private MessageRetentionService retentionService;

    @Test
    void archiveOldMessages_ShouldArchiveMessages_WhenPolicyExists() {
        // Given
        KafkaConnection connection = KafkaConnection.builder().id(1L).build();
        KafkaTopic topic = KafkaTopic.builder().id(10L).connection(connection).build();
        
        RetentionPolicy policy = RetentionPolicy.builder()
                .hotRetentionHours(24)
                .archiveEnabled(true)
                .build();

        KafkaMessage message = KafkaMessage.builder()
                .id(100L)
                .topic(topic)
                .timestamp(LocalDateTime.now().minusHours(25))
                .value("test-value")
                .build();

        given(topicRepository.findAll()).willReturn(List.of(topic));
        given(policyRepository.findEffectivePolicy(10L, 1L)).willReturn(Optional.of(policy));
        given(messageRepository.findMessagesOlderThan(eq(10L), any(LocalDateTime.class), any(Pageable.class)))
                .willReturn(List.of(message));
        
        given(jobLogRepository.save(any(RetentionJobLog.class))).willAnswer(inv -> inv.getArgument(0));

        // When
        RetentionJobLog log = retentionService.archiveOldMessages();

        // Then
        assertThat(log.getMessagesArchived()).isEqualTo(1);
        then(archiveRepository).should().saveAll(any());
        then(messageRepository).should().deleteAll(any());
    }

    @Test
    void archiveOldMessages_ShouldOnlyDelete_WhenArchiveDisabled() {
        // Given
        KafkaConnection connection = KafkaConnection.builder().id(1L).build();
        KafkaTopic topic = KafkaTopic.builder().id(10L).connection(connection).build();

        RetentionPolicy policy = RetentionPolicy.builder()
                .hotRetentionHours(24)
                .archiveEnabled(false) // Archive disabled
                .build();

        KafkaMessage message = KafkaMessage.builder()
                .id(100L)
                .topic(topic)
                .timestamp(LocalDateTime.now().minusHours(25))
                .build();

        given(topicRepository.findAll()).willReturn(List.of(topic));
        given(policyRepository.findEffectivePolicy(10L, 1L)).willReturn(Optional.of(policy));
        given(messageRepository.findMessagesOlderThan(eq(10L), any(LocalDateTime.class), any(Pageable.class)))
                .willReturn(List.of(message));
        
        given(jobLogRepository.save(any(RetentionJobLog.class))).willAnswer(inv -> inv.getArgument(0));

        // When
        RetentionJobLog log = retentionService.archiveOldMessages();

        // Then
        assertThat(log.getMessagesArchived()).isEqualTo(0);
        assertThat(log.getMessagesDeleted()).isEqualTo(1);
        then(archiveRepository).shouldHaveNoInteractions();
        then(messageRepository).should().deleteAll(any());
    }

    @Test
    void purgeExpiredArchives_ShouldDeleteOldArchives() {
        // Given
        KafkaConnection connection = KafkaConnection.builder().id(1L).build();
        KafkaTopic topic = KafkaTopic.builder().id(10L).connection(connection).build();

        RetentionPolicy policy = RetentionPolicy.builder()
                .archiveRetentionDays(30)
                .autoPurgeEnabled(true)
                .build();

        given(topicRepository.findAll()).willReturn(List.of(topic));
        given(policyRepository.findEffectivePolicy(10L, 1L)).willReturn(Optional.of(policy));
        given(archiveRepository.deleteExpiredArchives(eq(10L), any(LocalDateTime.class))).willReturn(5);
        
        given(jobLogRepository.save(any(RetentionJobLog.class))).willAnswer(inv -> inv.getArgument(0));

        // When
        RetentionJobLog log = retentionService.purgeExpiredArchives();

        // Then
        assertThat(log.getMessagesDeleted()).isEqualTo(5);
        then(archiveRepository).should().deleteExpiredArchives(eq(10L), any(LocalDateTime.class));
    }

    @Test
    void resetTopic_ShouldDeleteAllMessages() {
        // Given
        Long topicId = 10L;
        given(messageRepository.deleteByTopicId(topicId)).willReturn(50);
        given(archiveRepository.deleteByTopicId(topicId)).willReturn(20);

        // When
        int deletedCount = retentionService.resetTopic(topicId, true);

        // Then
        assertThat(deletedCount).isEqualTo(70); // 50 messages + 20 archives
        then(messageRepository).should().deleteByTopicId(topicId);
        then(archiveRepository).should().deleteByTopicId(topicId);
    }
    
    @Test
    void bookmarkMessage_ShouldUpdateStatus() {
        // Given
        Long messageId = 1L;
        KafkaMessage message = KafkaMessage.builder().id(messageId).isBookmarked(false).build();
        given(messageRepository.findById(messageId)).willReturn(Optional.of(message));

        // When
        retentionService.bookmarkMessage(messageId, true);

        // Then
        assertThat(message.getIsBookmarked()).isTrue();
        then(messageRepository).should().save(message);
    }
}
