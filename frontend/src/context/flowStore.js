import { create } from 'zustand';
import { flowApi } from '@services/api';

export const useFlowStore = create((set, get) => ({
  // Current flow state (persists during session)
  nodes: [],
  edges: [],
  currentFlow: null, // Saved flow metadata from DB
  liveMode: true,
  
  // History for undo
  historyStack: [],
  
  // Saved flows from DB
  flows: [],
  
  // Loading states
  isLoading: false,
  isSaving: false,
  
  // Track if there are unsaved changes
  hasUnsavedChanges: false,

  // ============================================================
  // Session State Actions (in-memory, survives navigation)
  // ============================================================

  setNodes: (nodes) => {
    set({ nodes, hasUnsavedChanges: true });
  },

  setEdges: (edges) => {
    set({ edges, hasUnsavedChanges: true });
  },

  setLiveMode: (liveMode) => {
    const { edges } = get();
    // Update all edges with new live mode
    const updatedEdges = edges.map(edge => ({
      ...edge,
      animated: liveMode,
      data: { ...edge.data, active: liveMode },
    }));
    set({ liveMode, edges: updatedEdges });
  },

  // Update a single node's data
  updateNodeData: (nodeId, newData) => {
    const { nodes } = get();
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, data: newData } : node
    );
    set({ nodes: updatedNodes, hasUnsavedChanges: true });
  },

  // Delete a node and its connected edges
  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter(n => n.id !== nodeId),
      edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      hasUnsavedChanges: true,
    });
  },

  // Delete selected nodes
  deleteSelectedNodes: () => {
    const { nodes, edges } = get();
    const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
    if (selectedIds.length === 0) return 0;
    
    set({
      nodes: nodes.filter(n => !n.selected),
      edges: edges.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)),
      hasUnsavedChanges: true,
    });
    
    return selectedIds.length;
  },

  // Add a node
  addNode: (node) => {
    const { nodes } = get();
    set({ nodes: [...nodes, node], hasUnsavedChanges: true });
  },

  // Add an edge
  addEdge: (edge) => {
    const { edges } = get();
    set({ edges: [...edges, edge], hasUnsavedChanges: true });
  },

  // ============================================================
  // History Actions (undo support)
  // ============================================================

  saveToHistory: () => {
    const { nodes, edges, historyStack } = get();
    if (nodes.length === 0) return;
    
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    
    const newStack = [...historyStack, snapshot].slice(-20); // Keep last 20
    set({ historyStack: newStack });
  },

  undo: () => {
    const { historyStack } = get();
    if (historyStack.length === 0) return false;
    
    const lastState = historyStack[historyStack.length - 1];
    set({
      nodes: lastState.nodes,
      edges: lastState.edges,
      historyStack: historyStack.slice(0, -1),
      hasUnsavedChanges: true,
    });
    
    return true;
  },

  clearHistory: () => {
    set({ historyStack: [] });
  },

  // ============================================================
  // Auto Generate
  // ============================================================

  autoGenerate: (topics, connections, liveMode) => {
    const monitoredTopics = topics.filter(t => t.monitored);
    
    if (monitoredTopics.length === 0) {
      return { success: false, message: 'No monitored topics found' };
    }

    // Save current state before generating
    get().saveToHistory();

    // Group topics by connection
    const topicsByConnection = {};
    monitoredTopics.forEach(topic => {
      if (!topicsByConnection[topic.connectionId]) {
        topicsByConnection[topic.connectionId] = [];
      }
      topicsByConnection[topic.connectionId].push(topic);
    });

    const newNodes = [];
    const newEdges = [];
    let yOffset = 100;

    Object.entries(topicsByConnection).forEach(([connectionId, connectionTopics]) => {
      const connection = connections.find(c => c.id === Number(connectionId));
      const xBase = 100;
      
      const connNodeId = `connection-${connectionId}`;
      newNodes.push({
        id: connNodeId,
        type: 'application',
        position: { x: xBase, y: yOffset },
        data: {
          label: connection?.name || 'Kafka Cluster',
          sublabel: connection?.bootstrapServers,
          color: '#3b82f6',
        },
      });

      connectionTopics.forEach((topic, topicIndex) => {
        const topicNodeId = `topic-${topic.id}`;
        newNodes.push({
          id: topicNodeId,
          type: 'topic',
          position: { x: xBase + 300, y: yOffset + topicIndex * 100 },
          data: {
            label: topic.name,
            topicId: topic.id,
            topicName: topic.name,
            messageCount: topic.messageCount || 0,
            monitored: topic.monitored,
          },
        });

        newEdges.push({
          id: `edge-${connNodeId}-${topicNodeId}`,
          source: connNodeId,
          target: topicNodeId,
          type: 'laser',
          animated: liveMode,
          data: { active: liveMode, color: '#06b6d4' },
          markerEnd: { type: 'arrowclosed', color: '#06b6d4' },
        });
      });

      yOffset += (connectionTopics.length + 1) * 100 + 50;
    });

    set({ 
      nodes: newNodes, 
      edges: newEdges, 
      hasUnsavedChanges: true 
    });

    return { 
      success: true, 
      nodesCount: newNodes.length, 
      edgesCount: newEdges.length 
    };
  },

  // ============================================================
  // Auto Layout
  // ============================================================

  autoLayout: () => {
    const { nodes, saveToHistory } = get();
    if (nodes.length === 0) return;
    
    // Save before layout change
    saveToHistory();
    
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 4) * 250 + 100,
        y: Math.floor(index / 4) * 150 + 100,
      },
    }));
    
    set({ nodes: layoutedNodes, hasUnsavedChanges: true });
  },

  // ============================================================
  // Database Persistence Actions
  // ============================================================

  // Fetch all saved flows from DB
  fetchFlows: async () => {
    set({ isLoading: true });
    try {
      const response = await flowApi.getAll();
      const flows = response.data || response || [];
      set({ flows, isLoading: false });
      return flows;
    } catch (error) {
      console.error('Failed to fetch flows:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Save current flow to DB
  saveFlow: async (name) => {
    const { nodes, edges, liveMode, currentFlow } = get();
    
    if (nodes.length === 0) {
      throw new Error('Nothing to save');
    }

    set({ isSaving: true });
    try {
      const flowData = {
        name: name || currentFlow?.name || `Flow ${new Date().toLocaleDateString()}`,
        description: currentFlow?.description || '',
        connectionId: null,
        nodes,
        edges,
        liveMode,
        autoLayout: false,
      };

      let savedFlow;
      if (currentFlow?.id) {
        const response = await flowApi.update(currentFlow.id, flowData);
        savedFlow = response.data || response;
      } else {
        const response = await flowApi.create(flowData);
        savedFlow = response.data || response;
      }

      set({ 
        currentFlow: savedFlow, 
        hasUnsavedChanges: false,
        isSaving: false,
      });

      // Refresh flows list
      get().fetchFlows();

      return savedFlow;
    } catch (error) {
      console.error('Failed to save flow:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  // Load a flow from DB
  loadFlow: (flow) => {
    set({
      nodes: flow.nodes || [],
      edges: flow.edges || [],
      liveMode: flow.liveMode || false,
      currentFlow: flow,
      hasUnsavedChanges: false,
      historyStack: [],
    });
  },

  // Delete a flow from DB
  deleteFlow: async (id) => {
    const { currentFlow } = get();
    try {
      await flowApi.delete(id);
      
      // If we deleted the current flow, clear it
      if (currentFlow?.id === id) {
        set({
          nodes: [],
          edges: [],
          currentFlow: null,
          hasUnsavedChanges: false,
          historyStack: [],
        });
      }

      // Refresh flows list
      get().fetchFlows();
      
      return true;
    } catch (error) {
      console.error('Failed to delete flow:', error);
      throw error;
    }
  },

  // Create new empty flow
  newFlow: () => {
    set({
      nodes: [],
      edges: [],
      currentFlow: null,
      hasUnsavedChanges: false,
      historyStack: [],
    });
  },
}));