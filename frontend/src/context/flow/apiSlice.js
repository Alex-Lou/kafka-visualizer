// apiSlice.js - Sauvegarde BDD et Auto-generate
// ==============================================

import { flowApi } from '@services/api';
import { STATUS, STATUS_COLORS } from '@components/flow/constants';
import { startAutoSave, stopAutoSave } from './persistence';

// État initial
export const apiInitialState = {
  currentFlow: null,
  flows: [],
  isLoading: false,
  isSaving: false,
  autoSaveEnabled: false,
  lastAutoSave: null,
};

// Actions
export const createApiActions = (set, get) => ({
  // ===================================================
  // Auto-save
  // ===================================================

  setAutoSaveEnabled: (enabled) => {
    set({ autoSaveEnabled: enabled });
    
    if (enabled) {
      startAutoSave(async () => {
        const state = get();
        if (state.nodes.length > 0 && state.hasUnsavedChanges && !state.isSaving) {
          try {
            await state.saveFlow();
            set({ lastAutoSave: new Date().toISOString() });
          } catch (error) {
            // Silent fail for auto-save
          }
        }
      });
    } else {
      stopAutoSave();
    }
  },

  // ===================================================
  // CRUD Database
  // ===================================================

  fetchFlows: async () => {
    set({ isLoading: true });
    try {
      const response = await flowApi.getAll();
      const flows = response.data || response || [];
      set({ flows, isLoading: false });
      return flows;
    } catch (error) {
      console.error('Erreur fetch flows:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  saveFlow: async (name) => {
    const { nodes, edges, liveMode, currentFlow } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];
    
    if (safeNodes.length === 0) {
      throw new Error('Rien à sauvegarder');
    }

    // ✅ Extraire connectionId depuis les nodes cluster (type 'application')
    const clusterNode = safeNodes.find(n => n.type === 'application' && n.data?.connectionId);
    const connectionId = clusterNode?.data?.connectionId || currentFlow?.connectionId || null;

    set({ isSaving: true });
    
    try {
      const flowData = {
        name: name || currentFlow?.name || `Flow ${new Date().toLocaleDateString()}`,
        description: currentFlow?.description || '',
        connectionId: connectionId,
        nodes: safeNodes,
        edges: safeEdges,
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

      get().fetchFlows();
      return savedFlow;
    } catch (error) {
      console.error('Erreur save flow:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  loadFlow: (flow) => {
    const loadedNodes = Array.isArray(flow.nodes) ? flow.nodes : [];
    const loadedEdges = Array.isArray(flow.edges) ? flow.edges : [];
    
    set({
      nodes: loadedNodes,
      edges: loadedEdges,
      liveMode: flow.liveMode || false,
      currentFlow: flow,
      hasUnsavedChanges: false,
      historyStack: [],
      redoStack: [],
    });
  },

  deleteFlow: async (id) => {
    const { currentFlow } = get();
    
    try {
      await flowApi.delete(id);
      
      if (currentFlow?.id === id) {
        set({
          nodes: [],
          edges: [],
          currentFlow: null,
          hasUnsavedChanges: false,
          historyStack: [],
          redoStack: [],
        });
      }

      get().fetchFlows();
      return true;
    } catch (error) {
      console.error('Erreur delete flow:', error);
      throw error;
    }
  },

  newFlow: () => {
    set({
      nodes: [],
      edges: [],
      currentFlow: null,
      hasUnsavedChanges: false,
      historyStack: [],
      redoStack: [],
    });
  },

  // ===================================================
  // Auto-generate & Auto-layout
  // ===================================================

  autoGenerate: (topics, connections, liveMode) => {
    // ✅ Vérifier qu'on a des connexions (peu importe leur statut)
    if (!connections || connections.length === 0) {
      return { success: false, message: 'Aucune connexion trouvée' };
    }

    const monitoredTopics = topics.filter(t => t.monitored);

    get().saveToHistory();

    // Grouper topics par connexion
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

    // ✅ Itérer sur TOUTES les connexions (pas seulement celles avec topics)
    connections.forEach((connection) => {
      const connectionId = connection.id;
      const connectionTopics = topicsByConnection[connectionId] || [];
      const xBase = 100;
      
      // Node connexion (cluster)
      const connNodeId = `connection-${connectionId}`;
      
      // ✅ Mapper le status backend vers le status frontend
      const clusterStatus = connection?.status === 'CONNECTED' ? 'active' :
                           connection?.status === 'ERROR' ? 'error' :
                           connection?.status === 'CONNECTING' ? 'connecting' : 'inactive';
      
      // ✅ Couleur selon le statut
      const clusterColor = clusterStatus === 'error' ? '#ef4444' :      // Rouge
                          clusterStatus === 'active' ? '#22c55e' :      // Vert
                          clusterStatus === 'connecting' ? '#f59e0b' :  // Orange
                          '#6b7280';                                     // Gris (inactive)
      
      newNodes.push({
        id: connNodeId,
        type: 'application',
        position: { x: xBase, y: yOffset },
        data: {
          label: connection?.name || 'Kafka Cluster',
          sublabel: connection?.bootstrapServers,
          color: clusterColor,
          connectionId: Number(connectionId),
          status: clusterStatus,
          topicsCount: connectionTopics.length,
        },
      });

      // Nodes topics + edges (seulement si la connexion a des topics monitorés)
      connectionTopics.forEach((topic, topicIndex) => {
        const topicNodeId = `topic-${topic.id}`;
        
        let topicStatus;
        if (!topic.monitored) {
          topicStatus = STATUS.UNMONITORED;
        } else if ((topic.messageCount || 0) > 0 || (topic.throughput || 0) > 0) {
          topicStatus = STATUS.ACTIVE;
        } else {
          topicStatus = STATUS.CONNECTED;
        }
        
        const edgeColor = STATUS_COLORS[topicStatus];
        
        newNodes.push({
          id: topicNodeId,
          type: 'topic',
          position: { x: xBase + 300, y: yOffset + topicIndex * 100 },
          data: {
            label: topic.name,
            topicId: topic.id,
            topicName: topic.name,
            messageCount: topic.messageCount || 0,
            throughput: topic.throughput || 0,
            monitored: topic.monitored,
            status: topicStatus,
            connectionId: Number(connectionId),
          },
        });

        newEdges.push({
          id: `edge-${connNodeId}-${topicNodeId}`,
          source: connNodeId,
          target: topicNodeId,
          type: 'laser',
          animated: (topicStatus === STATUS.ACTIVE || topicStatus === STATUS.CONNECTED) && liveMode,
          data: { 
            status: topicStatus,
            active: topicStatus !== STATUS.INACTIVE && topicStatus !== STATUS.UNMONITORED, 
            color: edgeColor 
          },
          markerEnd: { type: 'arrowclosed', color: edgeColor },
        });
      });

      // ✅ Offset adapté (minimum 1 pour les connexions sans topics)
      yOffset += Math.max(connectionTopics.length, 1) * 100 + 50;
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

  autoLayout: () => {
    const { nodes, saveToHistory } = get();
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    
    if (safeNodes.length === 0) return;
    
    saveToHistory();
    
    const layoutedNodes = safeNodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 4) * 250 + 100,
        y: Math.floor(index / 4) * 150 + 100,
      },
    }));
    
    set({ nodes: layoutedNodes, hasUnsavedChanges: true });
  },
});