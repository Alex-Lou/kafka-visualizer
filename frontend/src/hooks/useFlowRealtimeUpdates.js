import { useEffect, useRef, useCallback } from 'react';
import { wsService } from '@services/websocket';
import { useFlowStore } from '@context/flow';
import { STATUS, STATUS_COLORS } from '@components/flow/constants';

export const useFlowRealtimeUpdates = (enabled = true) => {
  const { nodes, setNodes, edges, setEdges, liveMode } = useFlowStore();
  const subscriptionsRef = useRef([]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLER: Topic Update (messageCount + throughput rapide)
  // ═══════════════════════════════════════════════════════════════════════
  const handleTopicUpdate = useCallback((data) => {
    const { topicId, topicName, messageCount, throughput } = data;

    setNodes(currentNodes => {
      return currentNodes.map(node => {
        // Matcher par topicId OU topicName
        if (node.type === 'topic' && 
            (node.data.topicId === topicId || node.data.topicName === topicName)) {
          
          const newMessageCount = messageCount ?? node.data.messageCount ?? 0;
          const newThroughput = throughput ?? node.data.throughput ?? 0;
          
          // Déterminer le nouveau statut
          let newStatus;
          if (newMessageCount > 0 || newThroughput > 0) {
            newStatus = STATUS.ACTIVE;
          } else if (node.data.monitored) {
            newStatus = STATUS.CONNECTED;
          } else {
            newStatus = STATUS.INACTIVE;
          }

          return {
            ...node,
            data: {
              ...node.data,
              messageCount: newMessageCount,
              throughput: newThroughput,
              status: newStatus,
            }
          };
        }
        return node;
      });
    });

    // ✅ Mettre à jour les edges associés
    setEdges(currentEdges => {
      return currentEdges.map(edge => {
        // Trouver si cet edge est lié au topic mis à jour
        const targetNodeId = `topic-${topicId}`;
        if (edge.target === targetNodeId || edge.target.includes(`topic-${topicId}`)) {
          const isActive = (messageCount > 0 || throughput > 0);
          const newStatus = isActive ? STATUS.ACTIVE : STATUS.CONNECTED;
          const edgeColor = STATUS_COLORS[newStatus];

          return {
            ...edge,
            animated: isActive && liveMode,
            data: {
              ...edge.data,
              status: newStatus,
              active: isActive,
              color: edgeColor,
            },
            markerEnd: { type: 'arrowclosed', color: edgeColor },
          };
        }
        return edge;
      });
    });
  }, [setNodes, setEdges, liveMode]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLER: Topic Metrics (métriques complètes)
  // ═══════════════════════════════════════════════════════════════════════
  const handleTopicMetrics = useCallback((metrics) => {
    const { 
      topicId, 
      topicName, 
      messageCount, 
      throughputPerSecond,
      throughputPerMinute,
      messagesLastMinute,
      consumerActive 
    } = metrics;

    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.type === 'topic' && 
            (node.data.topicId === topicId || node.data.topicName === topicName)) {
          
          const newThroughput = throughputPerSecond ?? 0;
          const newMessageCount = messageCount ?? node.data.messageCount ?? 0;
          
          // Déterminer le statut basé sur l'activité
          let newStatus;
          if (!consumerActive) {
            newStatus = STATUS.INACTIVE;
          } else if (newThroughput > 0 || newMessageCount > 0) {
            newStatus = STATUS.ACTIVE;
          } else if (node.data.monitored) {
            newStatus = STATUS.CONNECTED;
          } else {
            newStatus = STATUS.INACTIVE;
          }

          return {
            ...node,
            data: {
              ...node.data,
              messageCount: newMessageCount,
              throughput: newThroughput,
              throughputPerMinute: throughputPerMinute ?? 0,
              messagesLastMinute: messagesLastMinute ?? 0,
              consumerActive: consumerActive ?? false,
              status: newStatus,
            }
          };
        }
        return node;
      });
    });
  }, [setNodes]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLER: New Message (notification temps réel)
  // ═══════════════════════════════════════════════════════════════════════
  const handleNewMessage = useCallback((data) => {
    if (!data.payload) return;
    
    const { topicName } = data.payload;

    // Flash effect sur le node du topic
    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.type === 'topic' && node.data.topicName === topicName) {
          return {
            ...node,
            data: {
              ...node.data,
              // Incrémenter localement en attendant la mise à jour du backend
              messageCount: (node.data.messageCount || 0) + 1,
              lastMessageAt: new Date().toISOString(),
              status: STATUS.ACTIVE,
            }
          };
        }
        return node;
      });
    });
  }, [setNodes]);

  // ═══════════════════════════════════════════════════════════════════════
  // SETUP SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!enabled) return;

    const connectAndSubscribe = async () => {
      try {
        await wsService.connect();
        
        // ✅ S'abonner aux bons channels (comme définis dans le backend)
        const topicUpdateSub = wsService.subscribe('/topic/topics', (message) => {
          if (message.type === 'TOPIC_UPDATE' && message.payload) {
            handleTopicUpdate(message.payload);
          }
        });

        const topicMetricsSub = wsService.subscribe('/topic/metrics', (message) => {
          if (message.type === 'TOPIC_METRICS' && message.payload) {
            handleTopicMetrics(message.payload);
          }
        });

        const newMessageSub = wsService.subscribe('/topic/messages', (message) => {
          if (message.type === 'NEW_MESSAGE') {
            handleNewMessage(message);
          }
        });

        subscriptionsRef.current = [topicUpdateSub, topicMetricsSub, newMessageSub];
      } catch (error) {
        console.error('Failed to connect WebSocket for flow updates:', error);
      }
    };

    connectAndSubscribe();

    return () => {
      subscriptionsRef.current.forEach(sub => {
        if (sub) {
          try {
            sub.unsubscribe();
          } catch (e) {
            // Ignore unsubscribe errors
          }
        }
      });
      subscriptionsRef.current = [];
    };
  }, [enabled, handleTopicUpdate, handleTopicMetrics, handleNewMessage]);

  return {
    isRealtimeEnabled: enabled,
  };
};