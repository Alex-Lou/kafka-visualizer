// historySlice.js - Gestion Undo/Redo
// ====================================

import { MAX_HISTORY_SIZE } from './persistence';

// État initial
export const historyInitialState = {
  historyStack: [],
  redoStack: [],
};

// Actions
export const createHistoryActions = (set, get) => ({
  /**
   * Sauvegarde l'état actuel dans l'historique (avant une modification)
   * Vide le redoStack car on crée une nouvelle branche
   */
  saveToHistory: () => {
    const { nodes, edges, historyStack } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];
    
    if (safeNodes.length === 0) return;
    
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(safeNodes)),
      edges: JSON.parse(JSON.stringify(safeEdges)),
    };
    
    const newStack = [...historyStack, snapshot].slice(-MAX_HISTORY_SIZE);
    set({ historyStack: newStack, redoStack: [] });
  },

  /**
   * Annule la dernière action (Ctrl+Z)
   */
  undo: () => {
    const { nodes, edges, historyStack, redoStack } = get();
    if (historyStack.length === 0) return false;
    
    // Sauvegarde l'état actuel pour le redo
    const currentSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    
    const lastState = historyStack[historyStack.length - 1];
    set({
      nodes: Array.isArray(lastState.nodes) ? lastState.nodes : [],
      edges: Array.isArray(lastState.edges) ? lastState.edges : [],
      historyStack: historyStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot].slice(-MAX_HISTORY_SIZE),
      hasUnsavedChanges: true,
    });
    
    return true;
  },

  /**
   * Refait l'action annulée (Ctrl+Y)
   */
  redo: () => {
    const { nodes, edges, historyStack, redoStack } = get();
    if (redoStack.length === 0) return false;
    
    // Sauvegarde l'état actuel pour le undo
    const currentSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    
    const nextState = redoStack[redoStack.length - 1];
    set({
      nodes: Array.isArray(nextState.nodes) ? nextState.nodes : [],
      edges: Array.isArray(nextState.edges) ? nextState.edges : [],
      historyStack: [...historyStack, currentSnapshot].slice(-MAX_HISTORY_SIZE),
      redoStack: redoStack.slice(0, -1),
      hasUnsavedChanges: true,
    });
    
    return true;
  },

  /**
   * Vide tout l'historique
   */
  clearHistory: () => {
    set({ historyStack: [], redoStack: [] });
  },
});