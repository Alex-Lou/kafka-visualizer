import { create } from 'zustand';
import { connectionApi, topicApi, dashboardApi, retentionApi } from '@services/api';
import wsService from '@services/websocket';

// ============================================================================
// WebSocket Manager - Singleton pattern for global real-time updates
// ============================================================================

let wsInitialized = false;
let wsStatusListeners = new Set();

const notifyWsStatusChange = (connected) => {
  wsStatusListeners.forEach(listener => listener(connected));
  // Also update UI store
  useUIStore.getState().setWsConnected(connected);
};

export const initializeWebSocket = async () => {
  if (wsInitialized) {
    console.log('[WS] Already initialized');
    return true;
  }
  
  try {
    console.log('[WS] Connecting...');
    await wsService.connect();
    console.log('[WS] Connected, setting up subscriptions...');
    
    wsInitialized = true;
    notifyWsStatusChange(true);
    
    // Setup subscriptions AFTER connection is established
    setupWebSocketSubscriptions();
    
    // Handle disconnection/reconnection
    wsService.addConnectionListener((status) => {
      console.log('[WS] Status changed:', status);
      if (status === 'connected') {
        notifyWsStatusChange(true);
        // Re-setup subscriptions on reconnect
        setupWebSocketSubscriptions();
      } else if (status === 'disconnected') {
        notifyWsStatusChange(false);
        wsInitialized = false;
      }
    });
    
    return true;
  } catch (error) {
    console.error('[WS] Connection failed:', error);
    notifyWsStatusChange(false);
    wsInitialized = false;
    
    // Retry after 5s
    setTimeout(() => {
      console.log('[WS] Retrying connection...');
      initializeWebSocket();
    }, 5000);
    
    return false;
  }
};

const setupWebSocketSubscriptions = () => {
  console.log('[WS] Setting up subscriptions...');
  
  // Subscribe to new messages
  wsService.subscribe('/topic/messages', (message) => {
    console.log('[WS] Received message:', message.type);
    
    if (message.type === 'NEW_MESSAGE' && message.payload) {
      // Add message to store
      const { addMessage } = useMessageStore.getState();
      addMessage(message.payload);
      
      // Update topic count immediately
      const { updateTopicCountByName } = useTopicStore.getState();
      updateTopicCountByName(message.payload.topicName, 1);
      
      // Update dashboard stats
      const { incrementMessageCount } = useDashboardStore.getState();
      incrementMessageCount();
      
      console.log('[WS] Message added for topic:', message.payload.topicName);
    }
  });

  // Subscribe to topic updates
  wsService.subscribe('/topic/topics', (message) => {
    console.log('[WS] Received topic update:', message.type, message.payload);
    
    if (message.type === 'TOPIC_UPDATE' && message.payload) {
      const { topicId, messageCount } = message.payload;
      const { updateTopicCount } = useTopicStore.getState();
      updateTopicCount(topicId, messageCount);
    }
  });

  // Subscribe to connection status changes
  wsService.subscribe('/topic/connections', (message) => {
    console.log('[WS] Received connection update:', message.type);
    
    if (message.type === 'CONNECTION_STATUS' && message.payload) {
      const { connectionId, status } = message.payload;
      const { updateConnectionStatus } = useConnectionStore.getState();
      updateConnectionStatus(connectionId, status);
    }
  });

  console.log('[WS] All subscriptions active');
};

export const getWsConnected = () => wsInitialized;

export const subscribeToWsStatus = (listener) => {
  wsStatusListeners.add(listener);
  // Immediately notify current status
  listener(wsInitialized);
  return () => wsStatusListeners.delete(listener);
};

// ============================================================================
// Connection Store
// ============================================================================

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

  updateConnectionStatus: (connectionId, status) => {
    const connections = get().connections.map((c) =>
      c.id === connectionId ? { ...c, status } : c
    );
    set({ connections });
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

// ============================================================================
// Topic Store
// ============================================================================

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
      const existingTopics = get().topics.filter(t => t.connectionId !== connectionId);
      const newTopics = Array.isArray(data) ? data : [];
      set({ topics: [...existingTopics, ...newTopics], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAllTopics: async () => {
    const { connections } = useConnectionStore.getState();
    if (connections.length === 0) {
      console.log('[Topics] No connections, skipping fetch');
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const allTopics = [];
      for (const connection of connections) {
        try {
          const response = await topicApi.getByConnection(connection.id);
          const data = response.data || response;
          if (Array.isArray(data)) {
            allTopics.push(...data);
          }
        } catch (e) {
          console.error('[Topics] Failed for connection:', connection.name, e);
        }
      }
      set({ topics: allTopics, isLoading: false });
      console.log('[Topics] Loaded', allTopics.length, 'topics');
    } catch (error) {
      set({ error: error.message, isLoading: false });
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
      const existingTopics = get().topics.filter(t => t.connectionId !== connectionId);
      const newTopics = Array.isArray(data) ? data : [];
      set({ topics: [...existingTopics, ...newTopics], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearTopics: () => {
    set({ topics: [], selectedTopic: null });
  },

  deleteTopic: async (id) => {
    try {
      await topicApi.delete(id);
      const topics = get().topics.filter((t) => t.id !== id);
      set({ topics });
    } catch (error) {
      throw error;
    }
  },

  // Bulk delete topics
  deleteTopics: async (ids) => {
    const results = { success: 0, failed: 0 };
    for (const id of ids) {
      try {
        await topicApi.delete(id);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    // Refresh topics after bulk delete
    const topics = get().topics.filter((t) => !ids.includes(t.id));
    set({ topics });
    return results;
  },

  updateTopicCount: (topicId, newCount) => {
    const topics = get().topics.map((t) =>
      t.id === topicId ? { ...t, messageCount: newCount } : t
    );
    set({ topics });
  },

  updateTopicCountByName: (topicName, increment = 1) => {
    const topics = get().topics.map((t) =>
      t.name === topicName 
        ? { ...t, messageCount: (t.messageCount || 0) + increment, lastMessageAt: new Date().toISOString() } 
        : t
    );
    set({ topics });
  },
}));

// ============================================================================
// Message Store (Enhanced with Retention)
// ============================================================================

export const useMessageStore = create((set, get) => ({
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

  // NEW: Retention filters
  filters: {
    messageType: 'ALL',
    source: 'HOT',
    timeRange: '24h',
    showBookmarked: false,
  },

  // NEW: Quick stats
  stats: {
    totalMessages: 0,
    errorCount: 0,
    warningCount: 0,
    throughput: 0,
    totalSize: '0 B',
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

  // NEW: Unified fetch method that handles both HOT and ARCHIVE
  fetchFilteredMessages: async (topicId) => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      if (filters.source === 'ARCHIVE') {
        // Fetch from archives
        const response = await retentionApi.getArchives({
          topicId,
          messageType: filters.messageType !== 'ALL' ? filters.messageType : undefined,
          bookmarked: filters.showBookmarked ? true : undefined
        });
        const data = response.data || response;
        set({
          messages: Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [],
          isLoading: false,
        });
      } else {
        // Fetch from hot storage (recent messages)
        // Note: For now we use getRecentMessages, but ideally we should support filtering here too
        const response = await topicApi.getRecentMessages(topicId);
        const data = response.data || response;
        let messages = Array.isArray(data) ? data : [];

        // Apply client-side filtering for HOT messages if backend doesn't support it yet
        if (filters.messageType !== 'ALL') {
          messages = messages.filter(m => m.messageType === filters.messageType);
        }
        if (filters.showBookmarked) {
          messages = messages.filter(m => m.isBookmarked);
        }

        set({ messages, isLoading: false });
      }
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

  // NEW METHODS
  fetchArchiveMessages: async (topicId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getArchives({ topicId, ...params });
      const data = response.data || response;
      set({
        messages: Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false, messages: [] });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  bookmarkMessage: async (messageId, bookmarked) => {
    try {
      await retentionApi.bookmarkMessage(messageId, bookmarked);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isBookmarked: bookmarked } : msg
        ),
      }));
    } catch (error) {
      console.error('Failed to bookmark:', error);
      throw error;
    }
  },

  fetchQuickStats: async (topicId) => {
    try {
      const response = await retentionApi.getTopicStorage(topicId);
      const data = response.data || response;
      set({
        stats: {
          totalMessages: data?.totalMessageCount || 0,
          errorCount: data?.errorCount || 0,
          warningCount: data?.warningCount || 0,
          throughput: data?.throughput || 0,
          totalSize: data?.archiveSizeFormatted || '0 B',
        },
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },
}));


// ============================================================================
// Dashboard Store
// ============================================================================

export const useDashboardStore = create((set, get) => ({
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

  updateStats: (newStats) => {
    set((state) => ({
      stats: { ...state.stats, ...newStats }
    }));
  },

  incrementMessageCount: () => {
    set((state) => {
      if (!state.stats) return state;
      return {
        stats: {
          ...state.stats,
          totalMessages: (state.stats.totalMessages || 0) + 1,
          messagesLast24h: (state.stats.messagesLast24h || 0) + 1,
        }
      };
    });
  },
}));

// ============================================================================
// UI Store
// ============================================================================

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  notifications: [],
  wsConnected: false,
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

  setWsConnected: (connected) => {
    set({ wsConnected: connected });
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

// ============================================================================
// Retention Store
// ============================================================================

export const useRetentionStore = create((set, get) => ({
  policies: [],
  globalPolicy: null,
  storageSummary: null,
  topicStorage: null,
  isLoading: false,
  error: null,

  fetchPolicies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getPolicies();
      const data = response.data || response;
      set({ policies: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, policies: [] });
    }
  },

  fetchGlobalPolicy: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getGlobalPolicy();
      set({ globalPolicy: response.data || response, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, globalPolicy: null });
    }
  },

  updatePolicy: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.updatePolicy(id, data);
      const updatedPolicy = response.data || response;

      // Update global policy if it was the one edited
      if (get().globalPolicy?.id === id) {
        set({ globalPolicy: updatedPolicy });
      }

      // Update the policy in the main list
      const policies = get().policies.map((p) => (p.id === id ? updatedPolicy : p));
      set({ policies, isLoading: false });

      return updatedPolicy;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchStorageSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getGlobalStorage();
      set({ storageSummary: response.data || response, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, storageSummary: null });
    }
  },

  fetchTopicStorage: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getTopicStorage(topicId);
      set({ topicStorage: response.data || response, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, topicStorage: null });
    }
  },

  // NEW: Archive topic manually
  archiveTopic: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.archiveTopic(topicId);
      set({ isLoading: false });
      return response.data || response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
