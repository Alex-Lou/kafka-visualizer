import { create } from 'zustand';
import { connectionApi, topicApi, dashboardApi } from '@services/api';

// Connection store
export const useConnectionStore = create((set, get) => ({
  connections: [],
  selectedConnection: null,
  isLoading: false,
  error: null,

  fetchConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await connectionApi.getAll();
      const data = response.data || response;
      set({ connections: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, connections: [] });
    }
  },

  selectConnection: (connection) => {
    set({ selectedConnection: connection });
  },

  createConnection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await connectionApi.create(data);
      const newConnection = response.data || response;
      const connections = [...get().connections, newConnection];
      set({ connections, isLoading: false });
      return newConnection;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateConnection: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await connectionApi.update(id, data);
      const updatedConnection = response.data || response;
      const connections = get().connections.map((c) =>
        c.id === id ? updatedConnection : c
      );
      set({ connections, isLoading: false });
      return updatedConnection;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteConnection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await connectionApi.delete(id);
      const connections = get().connections.filter((c) => c.id !== id);
      set({ connections, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  testConnection: async (id) => {
    try {
      const response = await connectionApi.test(id);
      const testedConnection = response.data || response;
      const connections = get().connections.map((c) =>
        c.id === id ? testedConnection : c
      );
      set({ connections });
      return testedConnection;
    } catch (error) {
      throw error;
    }
  },
}));

// Topic store
export const useTopicStore = create((set, get) => ({
  topics: [],
  selectedTopic: null,
  isLoading: false,
  error: null,

  fetchTopics: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await topicApi.getByConnection(connectionId);
      const data = response.data || response;
      set({ topics: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, topics: [] });
    }
  },

  selectTopic: (topic) => {
    set({ selectedTopic: topic });
  },

  updateTopic: async (id, data) => {
    try {
      const response = await topicApi.update(id, data);
      const updatedTopic = response.data || response;
      const topics = get().topics.map((t) =>
        t.id === id ? updatedTopic : t
      );
      set({ topics });
      return updatedTopic;
    } catch (error) {
      throw error;
    }
  },

  syncTopics: async (connectionId, topicNames) => {
    set({ isLoading: true, error: null });
    try {
      const response = await topicApi.sync(connectionId, topicNames);
      const data = response.data || response;
      set({ topics: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, topics: [] });
      throw error;
    }
  },

  clearTopics: () => {
    set({ topics: [], selectedTopic: null });
  },

  updateTopicCount: (topicId, newCount) => {
    const topics = get().topics.map((t) =>
      t.id === topicId ? { ...t, messageCount: newCount } : t
    );
    set({ topics });
  },
}));

// Message store
export const useMessageStore = create((set) => ({
  messages: [],
  selectedMessage: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 50,
    totalElements: 0,
    totalPages: 0,
  },

  fetchMessages: async (topicId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await topicApi.getMessages(topicId, params);
      const data = response.data || response;
      set({
        messages: Array.isArray(data?.content) ? data.content : [],
        pagination: {
          page: data?.number || 0,
          size: data?.size || 50,
          totalElements: data?.totalElements || 0,
          totalPages: data?.totalPages || 0,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false, messages: [] });
    }
  },

  fetchRecentMessages: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await topicApi.getRecentMessages(topicId);
      const data = response.data || response;
      set({ messages: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, messages: [] });
    }
  },

  selectMessage: (message) => {
    set({ selectedMessage: message });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [message, ...state.messages].slice(0, 100),
    }));
  },

  clearMessages: () => {
    set({ messages: [], selectedMessage: null });
  },
}));

// Dashboard store
export const useDashboardStore = create((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getStats();
      const data = response.data || response;
      set({ stats: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

// UI store
export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  notifications: [],
  notificationSettings: {
    messageAlerts: true,
    connectionStatus: true,
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  updateNotificationSettings: (settings) => {
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings },
    }));
  },
}));
