// nodesEdgesSlice.js - Gestion des nodes et edges
// =================================================

import { STATUS } from '@components/flow/constants';

// État initial
export const nodesEdgesInitialState = {
  nodes: [],
  edges: [],
  liveMode: true,
  hasUnsavedChanges: false,
};

// Actions
export const createNodesEdgesActions = (set, get) => ({
  /**
   * Met à jour les nodes (supporte array direct ou fonction updater)
   */
  setNodes: (nodesOrUpdater) => {
    if (typeof nodesOrUpdater === 'function') {
      const currentNodes = get().nodes;
      const newNodes = nodesOrUpdater(currentNodes);
      const safeNodes = Array.isArray(newNodes) ? newNodes : [];
      set({ nodes: safeNodes, hasUnsavedChanges: true });
    } else {
      const safeNodes = Array.isArray(nodesOrUpdater) ? nodesOrUpdater : [];
      set({ nodes: safeNodes, hasUnsavedChanges: true });
    }
  },

  /**
   * Met à jour les edges (supporte array direct ou fonction updater)
   */
  setEdges: (edgesOrUpdater) => {
    if (typeof edgesOrUpdater === 'function') {
      const currentEdges = get().edges;
      const newEdges = edgesOrUpdater(currentEdges);
      const safeEdges = Array.isArray(newEdges) ? newEdges : [];
      set({ edges: safeEdges, hasUnsavedChanges: true });
    } else {
      const safeEdges = Array.isArray(edgesOrUpdater) ? edgesOrUpdater : [];
      set({ edges: safeEdges, hasUnsavedChanges: true });
    }
  },

  /**
   * Active/désactive le mode live (animations)
   */
  setLiveMode: (liveMode) => {
    const { edges } = get();
    const safeEdges = Array.isArray(edges) ? edges : [];
    const updatedEdges = safeEdges.map(edge => ({
      ...edge,
      animated: liveMode && (edge.data?.status === STATUS.ACTIVE || edge.data?.status === STATUS.CONNECTED),
      data: { ...edge.data, active: liveMode },
    }));
    set({ liveMode, edges: updatedEdges });
  },

  /**
   * Met à jour les données d'un node spécifique
   */
  updateNodeData: (nodeId, newData) => {
    const { nodes } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const updatedNodes = safeNodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
    );
    set({ nodes: updatedNodes, hasUnsavedChanges: true });
  },

  /**
   * Supprime un node et ses edges connectés
   */
  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];
    set({
      nodes: safeNodes.filter(n => n.id !== nodeId),
      edges: safeEdges.filter(e => e.source !== nodeId && e.target !== nodeId),
      hasUnsavedChanges: true,
    });
  },

  /**
   * Supprime tous les nodes sélectionnés
   */
  deleteSelectedNodes: () => {
    const { nodes, edges } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];
    const selectedIds = safeNodes.filter(n => n.selected).map(n => n.id);
    
    if (selectedIds.length === 0) return 0;
    
    set({
      nodes: safeNodes.filter(n => !n.selected),
      edges: safeEdges.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)),
      hasUnsavedChanges: true,
    });
    
    return selectedIds.length;
  },

  /**
   * Ajoute un nouveau node
   */
  addNode: (node) => {
    const { nodes } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    set({ nodes: [...safeNodes, node], hasUnsavedChanges: true });
  },

  /**
   * Ajoute un nouvel edge
   */
  addEdge: (edge) => {
    const { edges } = get();
    const safeEdges = Array.isArray(edges) ? edges : [];
    set({ edges: [...safeEdges, edge], hasUnsavedChanges: true });
  },
});