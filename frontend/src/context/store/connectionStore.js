import { create } from 'zustand';
import { connectionApi } from '@services/api';
import { normalizeError, logError } from '../../exceptions/errorHandler';

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
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false, connections: [] });
    }
  },

  selectConnection: (connection) => {
    set({ selectedConnection: connection });
  },

  updateConnectionStatus: (connectionId, status) => {
    set(state => ({
      connections: state.connections.map((c) =>
        c.id === connectionId ? { ...c, status } : c
      ),
    }));
  },

  createConnection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await connectionApi.create(data);
      const newConnection = response.data || response;
      set(state => ({ connections: [...state.connections, newConnection], isLoading: false }));
      return newConnection;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },

  updateConnection: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await connectionApi.update(id, data);
      const updatedConnection = response.data || response;
      set(state => ({
        connections: state.connections.map((c) => (c.id === id ? updatedConnection : c)),
        isLoading: false
      }));
      return updatedConnection;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },

  deleteConnection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await connectionApi.delete(id);
      set(state => ({
        connections: state.connections.filter((c) => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      set({ error: appError.message, isLoading: false });
      throw appError;
    }
  },

  testConnection: async (id) => {
    try {
      const response = await connectionApi.test(id);
      const testedConnection = response.data || response;
      set(state => ({
        connections: state.connections.map((c) => (c.id === id ? testedConnection : c))
      }));
      return testedConnection;
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      throw appError;
    }
  },
}));
