// =========================================================================
// AJOUTER DANS LE FICHIER useFlowWebSocket.js OU DANS LE HOOK DU FLOW
// Ce code doit être ajouté là où tu gères les WebSocket pour le flow
// =========================================================================

// Handler pour TOPIC_UPDATE avec throughput
const handleTopicUpdate = useCallback((message) => {
  if (message.type === 'TOPIC_UPDATE' && message.payload) {
    const { topicId, topicName, messageCount, throughput, lastMessageAt } = message.payload;

    // Mettre à jour les nodes du flow
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        // Matcher par topicId OU par topicName
        const isMatchingTopic = 
          (node.type === 'topic' && node.data.topicId === topicId) ||
          (node.type === 'topic' && node.data.topicName === topicName) ||
          (node.type === 'topic' && node.data.label === topicName);

        if (isMatchingTopic) {
          return {
            ...node,
            data: {
              ...node.data,
              messageCount: messageCount,
              throughput: throughput || 0,  // ✅ Le throughput est maintenant inclus!
              lastMessageAt: lastMessageAt,
              // Mettre à jour le status si throughput > 0
              status: throughput > 0 ? 'active' : (node.data.monitored ? 'connected' : node.data.status),
            },
          };
        }
        return node;
      })
    );
  }

  // Handler pour TOPIC_METRICS (plus détaillé)
  if (message.type === 'TOPIC_METRICS' && message.payload) {
    const metrics = message.payload;

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isMatchingTopic = 
          (node.type === 'topic' && node.data.topicId === metrics.topicId) ||
          (node.type === 'topic' && node.data.topicName === metrics.topicName);

        if (isMatchingTopic) {
          return {
            ...node,
            data: {
              ...node.data,
              messageCount: metrics.messageCount,
              throughput: metrics.throughputPerSecond,
              throughputPerMinute: metrics.throughputPerMinute,
              messagesLastMinute: metrics.messagesLastMinute,
              lastMessageAt: metrics.lastMessageAt,
              consumerActive: metrics.consumerActive,
              status: metrics.throughputPerSecond > 0 ? 'active' : (node.data.monitored ? 'connected' : node.data.status),
            },
          };
        }
        return node;
      })
    );
  }
}, [setNodes]);

// ✅ S'abonner aux bons channels WebSocket
useEffect(() => {
  wsService.subscribe('/topic/topics', handleTopicUpdate);
  wsService.subscribe('/topic/metrics', handleTopicUpdate);

  return () => {
    wsService.unsubscribe('/topic/topics');
    wsService.unsubscribe('/topic/metrics');
  };
}, [handleTopicUpdate]);