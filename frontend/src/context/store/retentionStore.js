import { create } from 'zustand';
import { retentionApi } from '@services/api';
import { normalizeError, logError } from '../../exceptions/errorHandler';

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
      set({ policies: response.data || [], isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, policies: [] });
    }
  },

  fetchGlobalPolicy: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getGlobalPolicy();
      set({ globalPolicy: response.data || response, isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, globalPolicy: null });
    }
  },

  updatePolicy: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.updatePolicy(id, data);
      const updatedPolicy = response.data || response;
      if (get().globalPolicy?.id === id) {
        set({ globalPolicy: updatedPolicy });
      }
      set(state => ({
        policies: state.policies.map((p) => (p.id === id ? updatedPolicy : p)),
        isLoading: false
      }));
      return updatedPolicy;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },

  fetchStorageSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getGlobalStorage();
      set({ storageSummary: response.data || response, isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, storageSummary: null });
    }
  },

  fetchTopicStorage: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.getTopicStorage(topicId);
      set({ topicStorage: response.data || response, isLoading: false });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, topicStorage: null });
    }
  },

  archiveTopic: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.archiveTopic(topicId);
      set({ isLoading: false });
      return response.data || response;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },

  archiveMessages: async (messageIds) => {
    set({ isLoading: true, error: null });
    try {
      const response = await retentionApi.archiveMessages(messageIds);
      set({ isLoading: false });
      return response.data || response;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },
}));
