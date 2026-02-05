import { useEffect, useRef, useState, useCallback } from 'react';
import { wsService } from '@services/websocket';

/**
 * Hook pour les métriques temps réel du dashboard
 * S'abonne aux channels WebSocket:
 * - /topic/dashboard/realtime (toutes les 1s) - métriques légères
 * - /topic/dashboard/stats (toutes les 5s) - stats complètes
 */
export const useDashboardMetrics = (enabled = true) => {
  const subscriptionsRef = useRef([]);
  
  // ═══════════════════════════════════════════════════════════════════════
  // STATE - Métriques temps réel
  // ═══════════════════════════════════════════════════════════════════════
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    messagesPerSecond: 0,
    messagesLastMinute: 0,
    messagesLastHour: 0,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // STATE - Stats complètes du dashboard
  // ═══════════════════════════════════════════════════════════════════════
  const [dashboardStats, setDashboardStats] = useState({
    // Connections
    totalConnections: 0,
    activeConnections: 0,
    // Topics
    totalTopics: 0,
    monitoredTopics: 0,
    // Consumers
    activeConsumers: 0,
    runningThreads: 0,
    // Messages temps réel
    messagesPerSecond: 0,
    messagesLastMinute: 0,
    messagesLastHour: 0,
    // Messages historique
    messagesLast24h: 0,
    totalMessagesStored: 0,
    // Détails
    topTopics: [],
    messageTrends: [],
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  const handleRealtimeMetrics = useCallback((message) => {
    if (message.type === 'REALTIME_METRICS' && message.payload) {
      const { messagesPerSecond, messagesLastMinute, messagesLastHour } = message.payload;
      setRealtimeMetrics({
        messagesPerSecond: messagesPerSecond ?? 0,
        messagesLastMinute: messagesLastMinute ?? 0,
        messagesLastHour: messagesLastHour ?? 0,
      });
      setLastUpdate(new Date());
    }
  }, []);

  const handleDashboardStats = useCallback((message) => {
    if (message.type === 'DASHBOARD_STATS' && message.payload) {
      setDashboardStats(message.payload);
      // Aussi mettre à jour les métriques temps réel depuis les stats complètes
      setRealtimeMetrics({
        messagesPerSecond: message.payload.messagesPerSecond ?? 0,
        messagesLastMinute: message.payload.messagesLastMinute ?? 0,
        messagesLastHour: message.payload.messagesLastHour ?? 0,
      });
      setLastUpdate(new Date());
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
        setIsConnected(true);

        // Métriques temps réel légères (toutes les 1s)
        const realtimeSub = wsService.subscribe(
          '/topic/dashboard/realtime',
          handleRealtimeMetrics
        );

        // Stats complètes (toutes les 5s)
        const statsSub = wsService.subscribe(
          '/topic/dashboard/stats',
          handleDashboardStats
        );

        subscriptionsRef.current = [realtimeSub, statsSub].filter(Boolean);
      } catch (error) {
        console.error('Failed to connect WebSocket for dashboard metrics:', error);
        setIsConnected(false);
      }
    };

    connectAndSubscribe();

    // Connection status listener
    const removeListener = wsService.addConnectionListener((status) => {
      setIsConnected(status === 'connected');
    });

    return () => {
      subscriptionsRef.current.forEach(sub => {
        try {
          sub?.unsubscribe();
        } catch (e) {
          // Ignore
        }
      });
      subscriptionsRef.current = [];
      removeListener();
    };
  }, [enabled, handleRealtimeMetrics, handleDashboardStats]);

  // ═══════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // Métriques temps réel (mises à jour toutes les 1s)
    messagesPerSecond: realtimeMetrics.messagesPerSecond,
    messagesLastMinute: realtimeMetrics.messagesLastMinute,
    messagesLastHour: realtimeMetrics.messagesLastHour,

    // Stats complètes (mises à jour toutes les 5s)
    dashboardStats,

    // Helpers
    isConnected,
    lastUpdate,

    // Raccourcis pour les stats les plus utilisées
    totalConnections: dashboardStats.totalConnections,
    activeConnections: dashboardStats.activeConnections,
    totalTopics: dashboardStats.totalTopics,
    monitoredTopics: dashboardStats.monitoredTopics,
    activeConsumers: dashboardStats.activeConsumers,
    messagesLast24h: dashboardStats.messagesLast24h,
    totalMessagesStored: dashboardStats.totalMessagesStored,
  };
};

export default useDashboardMetrics;