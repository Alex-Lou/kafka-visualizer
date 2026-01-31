package com.kafkaflow.visualizer.controller.retention;

import com.kafkaflow.visualizer.model.KafkaConnection;
import com.kafkaflow.visualizer.model.KafkaMessageStats;
import com.kafkaflow.visualizer.model.KafkaTopic;
import com.kafkaflow.visualizer.repository.KafkaMessageStatsRepository;
import com.kafkaflow.visualizer.repository.KafkaTopicRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RetentionStatsController.class)
@DisplayName("RetentionStatsController Tests")
class RetentionStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KafkaMessageStatsRepository statsRepository;

    @MockBean
    private KafkaTopicRepository topicRepository;

    // =========================================================================
    // TEST DATA BUILDERS
    // =========================================================================

    private KafkaTopic createTestTopic(Long id, String name) {
        KafkaConnection connection = KafkaConnection.builder()
                .id(1L)
                .name("Test Connection")
                .build();

        return KafkaTopic.builder()
                .id(id)
                .name(name)
                .connection(connection)
                .build();
    }

    private KafkaMessageStats createTestStats(Long topicId, LocalDateTime hourBucket) {
        return KafkaMessageStats.builder()
                .id(1L)
                .topicId(topicId)
                .hourBucket(hourBucket)
                .messageCount(1000)
                .normalCount(900)
                .errorCount(50)
                .warningCount(30)
                .systemCount(20)
                .totalSizeBytes(102400L)
                .avgSizeBytes(102)
                .minSizeBytes(50)
                .maxSizeBytes(500)
                .messagesPerMinute(BigDecimal.valueOf(16.67))
                .peakMessagesPerMinute(25)
                .firstMessageAt(hourBucket)
                .lastMessageAt(hourBucket.plusMinutes(59))
                .build();
    }

    private Map<String, Object> createAggregatedStats(long totalMessages, long totalErrors,
                                                      long totalWarnings, long totalSize,
                                                      double avgThroughput, int peakThroughput) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMessages", totalMessages);
        stats.put("totalErrors", totalErrors);
        stats.put("totalWarnings", totalWarnings);
        stats.put("totalSize", totalSize);
        stats.put("avgThroughput", avgThroughput);
        stats.put("peakThroughput", peakThroughput);
        return stats;
    }

    // =========================================================================
    // GET TOPIC STATS
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/stats/topic/{topicId}")
    class GetTopicStats {

        @Test
        @DisplayName("Should return topic stats with default 24 hours")
        void shouldReturnTopicStatsWithDefault24Hours() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            Map<String, Object> aggregated = createAggregatedStats(5000L, 100L, 50L, 512000L, 3.5, 10);
            LocalDateTime now = LocalDateTime.now();
            List<KafkaMessageStats> hourlyStats = List.of(
                    createTestStats(1L, now.minusHours(2)),
                    createTestStats(1L, now.minusHours(1))
            );

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(statsRepository.getAggregatedStatsByTopicId(eq(1L), any(LocalDateTime.class)))
                    .willReturn(aggregated);
            given(statsRepository.getHourlyStats(eq(1L), any(LocalDateTime.class)))
                    .willReturn(hourlyStats);

            // When & Then
            mockMvc.perform(get("/api/retention/stats/topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topicId").value(1))
                    .andExpect(jsonPath("$.topicName").value("test-topic"))
                    .andExpect(jsonPath("$.timeRange").value("24 hours"))
                    .andExpect(jsonPath("$.totalMessages").value(5000))
                    .andExpect(jsonPath("$.totalErrors").value(100))
                    .andExpect(jsonPath("$.totalWarnings").value(50))
                    .andExpect(jsonPath("$.totalSizeBytes").value(512000))
                    .andExpect(jsonPath("$.avgThroughput").value(3.5))
                    .andExpect(jsonPath("$.peakThroughput").value(10))
                    .andExpect(jsonPath("$.hourlyBreakdown.length()").value(2));

            verify(topicRepository).findById(1L);
        }

        @Test
        @DisplayName("Should return topic stats with custom hours parameter")
        void shouldReturnTopicStatsWithCustomHoursParameter() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            Map<String, Object> aggregated = createAggregatedStats(10000L, 200L, 100L, 1024000L, 7.0, 20);

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(statsRepository.getAggregatedStatsByTopicId(eq(1L), any(LocalDateTime.class)))
                    .willReturn(aggregated);
            given(statsRepository.getHourlyStats(eq(1L), any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/retention/stats/topic/1")
                            .param("hours", "48"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.timeRange").value("48 hours"))
                    .andExpect(jsonPath("$.totalMessages").value(10000));
        }

        @Test
        @DisplayName("Should return zero values when no stats available")
        void shouldReturnZeroValuesWhenNoStatsAvailable() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            Map<String, Object> emptyStats = new HashMap<>();

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(statsRepository.getAggregatedStatsByTopicId(eq(1L), any(LocalDateTime.class)))
                    .willReturn(emptyStats);
            given(statsRepository.getHourlyStats(eq(1L), any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/retention/stats/topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalMessages").value(0))
                    .andExpect(jsonPath("$.totalErrors").value(0))
                    .andExpect(jsonPath("$.totalWarnings").value(0))
                    .andExpect(jsonPath("$.totalSizeBytes").value(0))
                    .andExpect(jsonPath("$.avgThroughput").value(0.0))
                    .andExpect(jsonPath("$.peakThroughput").value(0))
                    .andExpect(jsonPath("$.hourlyBreakdown").isEmpty());
        }

        @Test
        @DisplayName("Should return 404 when topic not found")
        void shouldReturn404WhenTopicNotFound() throws Exception {
            // Given
            given(topicRepository.findById(999L)).willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/stats/topic/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return hourly breakdown with all stats fields")
        void shouldReturnHourlyBreakdownWithAllStatsFields() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            Map<String, Object> aggregated = createAggregatedStats(1000L, 50L, 30L, 102400L, 16.67, 25);
            LocalDateTime hourBucket = LocalDateTime.of(2024, 1, 15, 10, 0, 0);
            KafkaMessageStats stats = createTestStats(1L, hourBucket);

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(statsRepository.getAggregatedStatsByTopicId(eq(1L), any(LocalDateTime.class)))
                    .willReturn(aggregated);
            given(statsRepository.getHourlyStats(eq(1L), any(LocalDateTime.class)))
                    .willReturn(List.of(stats));

            // When & Then
            mockMvc.perform(get("/api/retention/stats/topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.hourlyBreakdown[0].topicId").value(1))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].messageCount").value(1000))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].normalCount").value(900))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].errorCount").value(50))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].warningCount").value(30))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].systemCount").value(20))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].totalSizeBytes").value(102400))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].avgSizeBytes").value(102))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].minSizeBytes").value(50))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].maxSizeBytes").value(500))
                    .andExpect(jsonPath("$.hourlyBreakdown[0].peakMessagesPerMinute").value(25));
        }

        @Test
        @DisplayName("Should handle null messagesPerMinute gracefully")
        void shouldHandleNullMessagesPerMinuteGracefully() throws Exception {
            // Given
            KafkaTopic topic = createTestTopic(1L, "test-topic");
            Map<String, Object> aggregated = createAggregatedStats(1000L, 50L, 30L, 102400L, 0.0, 0);
            LocalDateTime hourBucket = LocalDateTime.of(2024, 1, 15, 10, 0, 0);
            KafkaMessageStats stats = createTestStats(1L, hourBucket);
            stats.setMessagesPerMinute(null);

            given(topicRepository.findById(1L)).willReturn(Optional.of(topic));
            given(statsRepository.getAggregatedStatsByTopicId(eq(1L), any(LocalDateTime.class)))
                    .willReturn(aggregated);
            given(statsRepository.getHourlyStats(eq(1L), any(LocalDateTime.class)))
                    .willReturn(List.of(stats));

            // When & Then
            mockMvc.perform(get("/api/retention/stats/topic/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.hourlyBreakdown[0].messagesPerMinute").value(0.0));
        }
    }

    // =========================================================================
    // GET DASHBOARD STATS
    // =========================================================================

    @Nested
    @DisplayName("GET /api/retention/stats/dashboard")
    class GetDashboardStats {

        @Test
        @DisplayName("Should return dashboard stats successfully")
        void shouldReturnDashboardStatsSuccessfully() throws Exception {
            // Given
            Map<String, Object> globalStats = new HashMap<>();
            globalStats.put("totalMessages", 50000L);
            globalStats.put("totalErrors", 500L);
            globalStats.put("totalWarnings", 250L);
            globalStats.put("avgThroughput", 35.5);

            List<Object[]> topByVolume = new ArrayList<>();
            topByVolume.add(new Object[]{1L, 20000L});
            topByVolume.add(new Object[]{2L, 15000L});
            topByVolume.add(new Object[]{3L, 10000L});

            List<Object[]> topByErrors = new ArrayList<>();
            topByErrors.add(new Object[]{2L, 200L});
            topByErrors.add(new Object[]{1L, 150L});

            given(statsRepository.getGlobalAggregatedStats(any(LocalDateTime.class)))
                    .willReturn(globalStats);
            given(statsRepository.getTopTopicsByMessageCount(any(LocalDateTime.class)))
                    .willReturn(topByVolume);
            given(statsRepository.getTopTopicsByErrorCount(any(LocalDateTime.class)))
                    .willReturn(topByErrors);
            given(topicRepository.findById(1L))
                    .willReturn(Optional.of(createTestTopic(1L, "topic-1")));
            given(topicRepository.findById(2L))
                    .willReturn(Optional.of(createTestTopic(2L, "topic-2")));
            given(topicRepository.findById(3L))
                    .willReturn(Optional.of(createTestTopic(3L, "topic-3")));

            // When & Then
            mockMvc.perform(get("/api/retention/stats/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalMessagesLast24h").value(50000))
                    .andExpect(jsonPath("$.totalErrorsLast24h").value(500))
                    .andExpect(jsonPath("$.totalWarningsLast24h").value(250))
                    .andExpect(jsonPath("$.currentThroughput").value(35.5))
                    .andExpect(jsonPath("$.topTopicsByVolume.length()").value(3))
                    .andExpect(jsonPath("$.topTopicsByVolume[0].topicId").value(1))
                    .andExpect(jsonPath("$.topTopicsByVolume[0].topicName").value("topic-1"))
                    .andExpect(jsonPath("$.topTopicsByVolume[0].messageCount").value(20000))
                    .andExpect(jsonPath("$.topTopicsByErrors.length()").value(2))
                    .andExpect(jsonPath("$.topTopicsByErrors[0].topicId").value(2))
                    .andExpect(jsonPath("$.topTopicsByErrors[0].errorCount").value(200));
        }

        @Test
        @DisplayName("Should return zero values when no stats available")
        void shouldReturnZeroValuesWhenNoStatsAvailable() throws Exception {
            // Given
            Map<String, Object> emptyStats = new HashMap<>();

            given(statsRepository.getGlobalAggregatedStats(any(LocalDateTime.class)))
                    .willReturn(emptyStats);
            given(statsRepository.getTopTopicsByMessageCount(any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());
            given(statsRepository.getTopTopicsByErrorCount(any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/retention/stats/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalMessagesLast24h").value(0))
                    .andExpect(jsonPath("$.totalErrorsLast24h").value(0))
                    .andExpect(jsonPath("$.totalWarningsLast24h").value(0))
                    .andExpect(jsonPath("$.currentThroughput").value(0.0))
                    .andExpect(jsonPath("$.topTopicsByVolume").isEmpty())
                    .andExpect(jsonPath("$.topTopicsByErrors").isEmpty());
        }

        @Test
        @DisplayName("Should limit top topics to 5")
        void shouldLimitTopTopicsToFive() throws Exception {
            // Given
            Map<String, Object> globalStats = createAggregatedStats(100000L, 1000L, 500L, 0L, 50.0, 100);

            List<Object[]> topByVolume = new ArrayList<>();
            topByVolume.add(new Object[]{1L, 30000L});
            topByVolume.add(new Object[]{2L, 25000L});
            topByVolume.add(new Object[]{3L, 20000L});
            topByVolume.add(new Object[]{4L, 15000L});
            topByVolume.add(new Object[]{5L, 10000L});
            topByVolume.add(new Object[]{6L, 5000L});
            topByVolume.add(new Object[]{7L, 2500L});

            given(statsRepository.getGlobalAggregatedStats(any(LocalDateTime.class)))
                    .willReturn(globalStats);
            given(statsRepository.getTopTopicsByMessageCount(any(LocalDateTime.class)))
                    .willReturn(topByVolume);
            given(statsRepository.getTopTopicsByErrorCount(any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());

            for (long i = 1; i <= 7; i++) {
                given(topicRepository.findById(i))
                        .willReturn(Optional.of(createTestTopic(i, "topic-" + i)));
            }

            // When & Then
            mockMvc.perform(get("/api/retention/stats/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topTopicsByVolume.length()").value(5))
                    .andExpect(jsonPath("$.topTopicsByVolume[4].topicId").value(5));
        }

        @Test
        @DisplayName("Should handle unknown topic gracefully")
        void shouldHandleUnknownTopicGracefully() throws Exception {
            // Given
            Map<String, Object> globalStats = createAggregatedStats(10000L, 100L, 50L, 0L, 10.0, 20);

            List<Object[]> topByVolume = new ArrayList<>();
            topByVolume.add(new Object[]{999L, 5000L});

            given(statsRepository.getGlobalAggregatedStats(any(LocalDateTime.class)))
                    .willReturn(globalStats);
            given(statsRepository.getTopTopicsByMessageCount(any(LocalDateTime.class)))
                    .willReturn(topByVolume);
            given(statsRepository.getTopTopicsByErrorCount(any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());
            given(topicRepository.findById(999L)).willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/retention/stats/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topTopicsByVolume[0].topicId").value(999))
                    .andExpect(jsonPath("$.topTopicsByVolume[0].topicName").value("Unknown"));
        }

        @Test
        @DisplayName("Should handle null values in global stats")
        void shouldHandleNullValuesInGlobalStats() throws Exception {
            // Given
            Map<String, Object> globalStats = new HashMap<>();
            globalStats.put("totalMessages", null);
            globalStats.put("totalErrors", null);
            globalStats.put("totalWarnings", null);
            globalStats.put("avgThroughput", null);

            given(statsRepository.getGlobalAggregatedStats(any(LocalDateTime.class)))
                    .willReturn(globalStats);
            given(statsRepository.getTopTopicsByMessageCount(any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());
            given(statsRepository.getTopTopicsByErrorCount(any(LocalDateTime.class)))
                    .willReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/retention/stats/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalMessagesLast24h").value(0))
                    .andExpect(jsonPath("$.totalErrorsLast24h").value(0))
                    .andExpect(jsonPath("$.totalWarningsLast24h").value(0))
                    .andExpect(jsonPath("$.currentThroughput").value(0.0));
        }
    }
}