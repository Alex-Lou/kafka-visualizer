import { create } from 'zustand';
import { topicApi, retentionApi } from '@services/api';
import { normalizeError, logError } from '../../exceptions/errorHandler';

export const useMessageStore = create((set, get) => ({
  messages: [],
  selectedMessage: null,
  isLoading: false,
  error: null,
  pagination: { page: 0, size: 50, totalElements: 0, totalPages: 0 },
  filters: { messageType: 'ALL', source: 'HOT', timeRange: '24h', showBookmarked: false },
  stats: { 
    totalMessages: 0, 
    messagesLast24h: 0,
    messagesLastHour: 0,
    errorCount: 0, 
    warningCount: 0,
    throughputPerSecond: 0,
    throughputPerMinute: 0,
    totalSizeFormatted: '0 B',
    lastMessageAt: null,
    isMonitored: false,
    consumerActive: false,
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
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, messages: [] });
    }
  },

  fetchRecentMessages: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await topicApi.getRecentMessages(topicId);
      const data = response.data || response;
      set({ messages: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, messages: [] });
    }
  },

  fetchFilteredMessages: async (topicId) => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      let response;
      if (filters.source === 'ARCHIVE') {
        response = await retentionApi.getArchives({
          topicId,
          messageType: filters.messageType !== 'ALL' ? filters.messageType : undefined,
          bookmarked: filters.showBookmarked ? true : undefined
        });
      } else {
        response = await topicApi.getRecentMessages(topicId);
      }

      let messages = response.data?.content || response.data || [];
      if (!Array.isArray(messages)) messages = [];

      if (filters.source !== 'ARCHIVE') {
        if (filters.messageType !== 'ALL') {
          messages = messages.filter(m => m.messageType === filters.messageType);
        }
        if (filters.showBookmarked) {
          messages = messages.filter(m => m.isBookmarked);
        }
      }
      set({ messages, isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, messages: [] });
    }
  },

  selectMessage: (message) => {
    set({ selectedMessage: message });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [message, ...state.messages].slice(0, 100),
      // ✅ Incrémenter les compteurs en temps réel
      stats: {
        ...state.stats,
        totalMessages: state.stats.totalMessages + 1,
        messagesLast24h: state.stats.messagesLast24h + 1,
        messagesLastHour: state.stats.messagesLastHour + 1,
      }
    }));
  },

  clearMessages: () => {
    set({ messages: [], selectedMessage: null });
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
        selectedMessage: state.selectedMessage?.id === messageId
          ? { ...state.selectedMessage, isBookmarked: bookmarked }
          : state.selectedMessage,
      }));
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      throw appError;
    }
  },

  // ✅ NOUVEAU: Utilise le nouvel endpoint live-stats
  fetchQuickStats: async (topicId) => {
    try {
      const response = await topicApi.getLiveStats(topicId);
      const data = response.data || response;
      set({ 
        stats: {
          totalMessages: data.totalMessages || 0,
          messagesLast24h: data.messagesLast24h || 0,
          messagesLastHour: data.messagesLastHour || 0,
          errorCount: data.errorCount || 0,
          warningCount: data.warningCount || 0,
          throughputPerSecond: data.throughputPerSecond || 0,
          throughputPerMinute: data.throughputPerMinute || 0,
          totalSizeFormatted: data.totalSizeFormatted || '0 B',
          lastMessageAt: data.lastMessageAt,
          isMonitored: data.isMonitored || false,
          consumerActive: data.consumerActive || false,
        }
      });
    } catch (error) {
      logError(normalizeError(error));
    }
  },
}));