import { create } from 'zustand';
import { dashboardApi } from '@services/api';
import { normalizeError, logError } from '../../exceptions/errorHandler';

export const useDashboardStore = create((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getStats();
      set({ stats: response.data || response, isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
    }
  },

  updateStats: (newStats) => {
    set((state) => ({ stats: { ...state.stats, ...newStats } }));
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
