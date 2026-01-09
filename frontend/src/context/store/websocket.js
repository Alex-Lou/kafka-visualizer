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
  wsService.subscribe('/topic/messages', (message) => {
    if (message.type === 'NEW_MESSAGE' && message.payload) {
      useMessageStore.getState().addMessage(message.payload);
      useTopicStore.getState().updateTopicCountByName(message.payload.topicName, 1);
      useDashboardStore.getState().incrementMessageCount();
    }
  });

  wsService.subscribe('/topic/topics', (message) => {
    if (message.type === 'TOPIC_UPDATE' && message.payload) {
      const { topicId, messageCount } = message.payload;
      useTopicStore.getState().updateTopicCount(topicId, messageCount);
    }
  });

  wsService.subscribe('/topic/connections', (message) => {
    if (message.type === 'CONNECTION_STATUS' && message.payload) {
      const { connectionId, status } = message.payload;
      useConnectionStore.getState().updateConnectionStatus(connectionId, status);
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

    wsService.addConnectionListener((status) => {
      notifyWsStatusChange(status === 'connected');
      if (status === 'connected' && wsInitialized) {
        setupWebSocketSubscriptions();
      } else if (status === 'disconnected') {
        wsInitialized = false;
        logError(new WebSocketError('Connection lost'));
      }
    });
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError);
    notifyWsStatusChange(false);
    wsInitialized = false;

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
