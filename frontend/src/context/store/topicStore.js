import { create } from 'zustand';
import { topicApi } from '@services/api';
import { normalizeError, logError } from '../../exceptions/errorHandler';
import { useConnectionStore } from './connectionStore';

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
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
    }
  },

  fetchAllTopics: async () => {
    const { connections } = useConnectionStore.getState();
    if (connections.length === 0) return;

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
          logError(normalizeError(e));
        }
      }
      set({ topics: allTopics, isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
    }
  },

  selectTopic: (topic) => {
    set({ selectedTopic: topic });
  },

  updateTopic: async (id, data) => {
    try {
      const response = await topicApi.update(id, data);
      const updatedTopic = response.data || response;
      set(state => ({
        topics: state.topics.map((t) => (t.id === id ? updatedTopic : t))
      }));
      return updatedTopic;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      throw appError;
    }
  },

  toggleTopicMonitoring: async (topicId) => {
    try {
      const currentTopic = get().topics.find(t => t.id === topicId);
      if (!currentTopic) {
        throw new Error('Topic not found');
      }

      const response = await topicApi.update(topicId, {
        monitored: !currentTopic.monitored
      });

      const updatedTopic = response.data || response;

      set(state => ({
        topics: state.topics.map((t) => (t.id === topicId ? updatedTopic : t))
      }));

      return updatedTopic;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      throw appError;
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
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },

  clearTopics: () => {
    set({ topics: [], selectedTopic: null });
  },

  deleteTopic: async (id) => {
    try {
      await topicApi.delete(id);
      set(state => ({ topics: state.topics.filter((t) => t.id !== id) }));
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      throw appError;
    }
  },

  deleteTopics: async (ids) => {
    const results = { success: 0, failed: 0 };
    for (const id of ids) {
      try {
        await topicApi.delete(id);
        results.success++;
      } catch (e) {
        results.failed++;
        logError(normalizeError(e));
      }
    }
    set(state => ({ topics: state.topics.filter((t) => !ids.includes(t.id)) }));
    return results;
  },

  // ✅ UPDATED - Mise à jour avec messageCount ET throughput
  updateTopicCount: (topicId, newCount, throughput = null) => {
    set(state => ({
      topics: state.topics.map((t) =>
        t.id === topicId 
          ? { 
              ...t, 
              messageCount: newCount,
              ...(throughput !== null && { throughput }),
              lastMessageAt: new Date().toISOString()
            } 
          : t
      ),
    }));
  },

  // ✅ UPDATED - Mise à jour par nom avec throughput
  updateTopicCountByName: (topicName, increment = 1, throughput = null) => {
    set(state => ({
      topics: state.topics.map((t) =>
        t.name === topicName
          ? { 
              ...t, 
              messageCount: (t.messageCount || 0) + increment, 
              ...(throughput !== null && { throughput }),
              lastMessageAt: new Date().toISOString() 
            }
          : t
      ),
    }));
  },

  // ✅ NEW - Mise à jour des métriques complètes
  updateTopicMetrics: (topicId, metrics) => {
    set(state => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              messageCount: metrics.messageCount ?? t.messageCount,
              throughput: metrics.throughputPerSecond ?? t.throughput ?? 0,
              throughputPerMinute: metrics.throughputPerMinute ?? 0,
              messagesLastMinute: metrics.messagesLastMinute ?? 0,
              lastMessageAt: metrics.lastMessageAt ?? t.lastMessageAt,
              consumerActive: metrics.consumerActive ?? false,
            }
          : t
      ),
    }));
  },

  // ✅ NEW - Récupérer un topic par ID
  getTopicById: (topicId) => {
    return get().topics.find(t => t.id === topicId);
  },

  // ✅ NEW - Récupérer le throughput d'un topic
  getTopicThroughput: (topicId) => {
    const topic = get().topics.find(t => t.id === topicId);
    return topic?.throughput ?? 0;
  },
}));