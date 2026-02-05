import { useEffect, useRef, useCallback } from 'react';
import { wsService } from '@services/websocket';
import { useTopicStore } from '@context/store/index';

/**
 * Hook pour mettre à jour le store des topics en temps réel via WebSocket
 * S'abonne aux channels:
 * - /topic/topics - updates de topics (messageCount, throughput)
 * - /topic/metrics - métriques complètes des topics
 * - /topic/messages - nouveaux messages
 */
export const useTopicsRealtimeUpdates = (enabled = true) => {
  const subscriptionsRef = useRef([]);
  const { updateTopicLocally } = useTopicStore();

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLER: Topic Update
  // ═══════════════════════════════════════════════════════════════════════
  const handleTopicUpdate = useCallback((message) => {
    if (message.type === 'TOPIC_UPDATE' && message.payload) {
      const { topicId, messageCount, throughput, lastMessageAt } = message.payload;
      
      updateTopicLocally(topicId, {
        messageCount,
        throughput,
        lastMessageAt,
      });
    }
  }, [updateTopicLocally]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLER: Topic Metrics
  // ═══════════════════════════════════════════════════════════════════════
  const handleTopicMetrics = useCallback((message) => {
    if (message.type === 'TOPIC_METRICS' && message.payload) {
      const { 
        topicId, 
        messageCount, 
        throughputPerSecond,
        throughputPerMinute,
        messagesLastMinute,
        lastMessageAt,
        consumerActive,
      } = message.payload;
      
      updateTopicLocally(topicId, {
        messageCount,
        throughput: throughputPerSecond,
        throughputPerMinute,
        messagesLastMinute,
        lastMessageAt,
        consumerActive,
      });
    }
  }, [updateTopicLocally]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLER: New Message
  // ═══════════════════════════════════════════════════════════════════════
  const handleNewMessage = useCallback((message) => {
    if (message.type === 'NEW_MESSAGE' && message.payload) {
      const { topicName } = message.payload;
      
      // Note: On ne peut pas mettre à jour directement car on n'a pas topicId
      // Les métriques arrivent via TOPIC_UPDATE de toute façon
      // Mais on pourrait émettre un event local pour un flash effect
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!enabled) return;

    const connectAndSubscribe = async () => {
      try {
        await wsService.connect();

        const topicUpdateSub = wsService.subscribe('/topic/topics', handleTopicUpdate);
        const topicMetricsSub = wsService.subscribe('/topic/metrics', handleTopicMetrics);
        const newMessageSub = wsService.subscribe('/topic/messages', handleNewMessage);

        subscriptionsRef.current = [topicUpdateSub, topicMetricsSub, newMessageSub].filter(Boolean);
      } catch (error) {
        console.error('Failed to connect WebSocket for topics updates:', error);
      }
    };

    connectAndSubscribe();

    return () => {
      subscriptionsRef.current.forEach(sub => {
        try {
          sub?.unsubscribe();
        } catch (e) {
          // Ignore
        }
      });
      subscriptionsRef.current = [];
    };
  }, [enabled, handleTopicUpdate, handleTopicMetrics, handleNewMessage]);

  return {
    isEnabled: enabled,
  };
};

export default useTopicsRealtimeUpdates;