import { useEffect, useRef } from 'react';
import { wsService } from '@services/websocket';
import { useFlowStore } from '@context/flow';
import { STATUS, STATUS_COLORS } from '@components/flow/constants';

export const useFlowRealtimeUpdates = (enabled = true) => {
  const { nodes, setNodes } = useFlowStore();
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    if (!enabled) return;

    const connectAndSubscribe = async () => {
      try {
        await wsService.connect();
        
        const topicUpdateSub = wsService.subscribe('/topic/topic-update', (data) => {
          handleTopicUpdate(data);
        });

        const newMessageSub = wsService.subscribe('/topic/new-message', (data) => {
          handleNewMessage(data);
        });

        subscriptionsRef.current = [topicUpdateSub, newMessageSub];
      } catch (error) {
        console.error('Failed to connect WebSocket for flow updates:', error);
      }
    };

    connectAndSubscribe();

    return () => {
      subscriptionsRef.current.forEach(sub => {
        if (sub) sub.unsubscribe();
      });
    };
  }, [enabled]);

  const handleTopicUpdate = (data) => {
    console.log('Topic update received:', data);

    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.type === 'topic' && 
            (node.data.topicId === data.topicId || node.data.topicName === data.topicName)) {
          
          const newMessageCount = data.messageCount || 0;
          const hasThroughput = (node.data.throughput || 0) > 0;
          
          let newStatus;
          if (newMessageCount > 0 || hasThroughput) {
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
              status: newStatus,
            }
          };
        }
        return node;
      });
    });

    // NE PLUS METTRE À JOUR LES EDGES ICI !
  };

  const handleNewMessage = (data) => {
    console.log('New message received:', data);
  };

  return {
    isRealtimeEnabled: enabled,
  };
};