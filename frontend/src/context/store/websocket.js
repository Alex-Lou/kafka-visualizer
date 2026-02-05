import wsService from '@services/websocket';
import { normalizeError, logError } from '../../exceptions/errorHandler';
import { WebSocketError } from '../../exceptions/types';
import { useUIStore } from './uiStore';
import { useMessageStore } from './messageStore';
import { useTopicStore } from './topicStore';
import { useConnectionStore } from './connectionStore';
import { useDashboardStore } from './dashboardStore';

let isInitializing = false;
let wsInitialized = false;
let wsStatusListeners = new Set();

const notifyWsStatusChange = (connected) => {
  wsStatusListeners.forEach(listener => listener(connected));
  useUIStore.getState().setWsConnected(connected);
};

const setupWebSocketSubscriptions = () => {
  const { addNotification, addToast, notificationSettings } = useUIStore.getState();

  // ═══════════════════════════════════════════════════════════════════════
  // NEW MESSAGES - Nouveau message reçu
  // ═══════════════════════════════════════════════════════════════════════
  wsService.subscribe('/topic/messages', (message) => {
    if (message.type === 'NEW_MESSAGE' && message.payload) {
      useMessageStore.getState().addMessage(message.payload);
      
      // ✅ Incrémenter le compteur (le throughput viendra via TOPIC_UPDATE)
      useTopicStore.getState().updateTopicCountByName(message.payload.topicName, 1);
      useDashboardStore.getState().incrementMessageCount();

      // Note: Pas de notification pour chaque message (trop de spam)
      // Les notifications sont réservées aux événements importants
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TOPIC UPDATE - Mise à jour rapide (messageCount + throughput)
  // ═══════════════════════════════════════════════════════════════════════
  wsService.subscribe('/topic/topics', (message) => {
    if (message.type === 'TOPIC_UPDATE' && message.payload) {
      const { topicId, messageCount, throughput } = message.payload;
      
      // ✅ Maintenant on passe aussi le throughput !
      useTopicStore.getState().updateTopicCount(topicId, messageCount, throughput);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TOPIC METRICS - Métriques complètes (toutes les 3 secondes)
  // ═══════════════════════════════════════════════════════════════════════
  wsService.subscribe('/topic/metrics', (message) => {
    if (message.type === 'TOPIC_METRICS' && message.payload) {
      const metrics = message.payload;
      
      // ✅ Mise à jour complète des métriques
      useTopicStore.getState().updateTopicMetrics(metrics.topicId, metrics);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CONNECTION STATUS - Statut des connexions Kafka
  // ═══════════════════════════════════════════════════════════════════════
  wsService.subscribe('/topic/connections', (message) => {
    if (message.type === 'CONNECTION_STATUS' && message.payload) {
      const { connectionId, status, name, error } = message.payload;
      useConnectionStore.getState().updateConnectionStatus(connectionId, status);

      // 🔔 NOTIFICATION: Changements de statut importants (dans la cloche)
      if (notificationSettings.connectionStatus) {
        if (status === 'CONNECTED') {
          addNotification({
            type: 'success',
            title: 'Connection Established',
            message: `Successfully connected to ${name || 'Kafka'}`
          });
        } else if (status === 'DISCONNECTED') {
          addNotification({
            type: 'warning',
            title: 'Connection Lost',
            message: `Disconnected from ${name || 'Kafka'}`
          });
        } else if (status === 'ERROR' || status === 'FAILED') {
          addNotification({
            type: 'error',
            title: 'Connection Failed',
            message: error || `Unable to connect to ${name || 'Kafka'}`
          });
        }
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FLOW ERRORS - Erreurs de flow (connexions brisées, topics manquants, etc.)
  // ═══════════════════════════════════════════════════════════════════════
  wsService.subscribe('/topic/flow-errors', (message) => {
    if (message.type === 'FLOW_ERROR' && message.payload) {
      const { errorType, title, description } = message.payload;

      if (notificationSettings.flowErrors) {
        addNotification({
          type: 'error',
          title: title || 'Flow Error',
          message: description || 'An error occurred in the flow'
        });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SYSTEM EVENTS - Événements système importants
  // ═══════════════════════════════════════════════════════════════════════
  wsService.subscribe('/topic/system-events', (message) => {
    if (message.type === 'SYSTEM_EVENT' && message.payload) {
      const { eventType, title, description, severity } = message.payload;

      if (notificationSettings.systemEvents) {
        const notifType = severity === 'critical' ? 'error' : 
                         severity === 'warning' ? 'warning' : 
                         severity === 'success' ? 'success' : 'info';

        addNotification({
          type: notifType,
          title: title || 'System Event',
          message: description || 'A system event occurred'
        });
      }
    }
  });
};

export const initializeWebSocket = async () => {
  if (wsInitialized || isInitializing) return;
  isInitializing = true;

  try {
    await wsService.connect();
    wsInitialized = true;
    notifyWsStatusChange(true);
    setupWebSocketSubscriptions();

    // 🎉 TOAST: Connexion WebSocket réussie (popup temporaire)
    const { addToast } = useUIStore.getState();
    addToast({
      type: 'success',
      title: 'Connected',
      message: 'Real-time updates enabled'
    });

    wsService.addConnectionListener((status) => {
      notifyWsStatusChange(status === 'connected');
      const { addToast, addNotification } = useUIStore.getState();
      
      if (status === 'connected' && wsInitialized) {
        setupWebSocketSubscriptions();
        addToast({
          type: 'success',
          title: 'Reconnected',
          message: 'Connection restored'
        });
      } else if (status === 'disconnected') {
        wsInitialized = false;
        logError(new WebSocketError('Connection lost'));
        
        // 🔔 NOTIFICATION: Perte de connexion importante (dans la cloche)
        addNotification({
          type: 'warning',
          title: 'WebSocket Disconnected',
          message: 'Real-time updates paused. Attempting to reconnect...'
        });
      }
    });
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError);
    notifyWsStatusChange(false);
    wsInitialized = false;

    // 🔔 NOTIFICATION: Erreur critique (dans la cloche)
    const { addNotification } = useUIStore.getState();
    addNotification({
      type: 'error',
      title: 'WebSocket Connection Failed',
      message: 'Unable to establish real-time connection. Retrying in 5 seconds...'
    });

    setTimeout(() => {
      initializeWebSocket();
    }, 5000);
  } finally {
    isInitializing = false;
  }
};

export const getWsConnected = () => wsInitialized;

export const subscribeToWsStatus = (listener) => {
  wsStatusListeners.add(listener);
  listener(wsInitialized);
  return () => wsStatusListeners.delete(listener);
};
