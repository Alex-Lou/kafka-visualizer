import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Set();
  }

  connect() {
    if (this.client?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyListeners('connected');
          resolve();
        },
        
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.notifyListeners('disconnected');
        },
        
        onStompError: (frame) => {
          console.error('WebSocket error:', frame.headers.message);
          this.notifyListeners('error', frame.headers.message);
          reject(new Error(frame.headers.message));
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((_, destination) => {
        this.unsubscribe(destination);
      });
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  subscribe(destination, callback) {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected, queuing subscription');
      return null;
    }

    if (this.subscriptions.has(destination)) {
      console.warn(`Already subscribed to ${destination}`);
      return this.subscriptions.get(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination, body) {
    if (!this.client?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  addConnectionListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(status, data) {
    this.listeners.forEach((callback) => callback(status, data));
  }
}

export const wsService = new WebSocketService();
export default wsService;
