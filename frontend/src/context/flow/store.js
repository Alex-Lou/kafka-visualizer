// store.js - Store principal qui assemble tous les slices
// ========================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Persistence & utils
import { 
  STORAGE_KEY, 
  createExpiringStorage, 
  initSessionMarker, 
  setupAutoSaveCleanup 
} from './persistence';

// Slices
import { historyInitialState, createHistoryActions } from './historySlice';
import { nodesEdgesInitialState, createNodesEdgesActions } from './nodesEdgesSlice';
import { apiInitialState, createApiActions } from './apiSlice';

// Initialisation
initSessionMarker();
setupAutoSaveCleanup();

// Store
export const useFlowStore = create(
  persist(
    (set, get) => ({
      // État initial combiné
      ...nodesEdgesInitialState,
      ...historyInitialState,
      ...apiInitialState,

      // Actions combinées
      ...createNodesEdgesActions(set, get),
      ...createHistoryActions(set, get),
      ...createApiActions(set, get),

      // Clear session
      clearLocalSession: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({
          nodes: [],
          edges: [],
          currentFlow: null,
          hasUnsavedChanges: false,
          historyStack: [],
          redoStack: [],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createExpiringStorage()),
      
      // Persister seulement ces champs
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        currentFlow: state.currentFlow,
        liveMode: state.liveMode,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
      
      // Au rechargement
      onRehydrateStorage: () => (state) => {
        if (state?.autoSaveEnabled) {
          setTimeout(() => {
            state.setAutoSaveEnabled(true);
          }, 1000);
        }
      },
    }
  )
);