import { useCallback } from 'react';
import { MarkerType } from 'reactflow';
import { getNodeDefaults, NODE_TYPE_COLORS } from './constants';

export function useFlowActions({ 
  nodes, 
  setNodes, 
  edges, 
  setEdges, 
  liveMode,
  reactFlowInstance,
  addNotification 
}) {
  
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
    if (selectedNodeIds.length === 0) return;
    
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));
    
    addNotification?.({
      type: 'success',
      title: 'Deleted',
      message: `Removed ${selectedNodeIds.length} node(s)`,
    });
  }, [nodes, setNodes, setEdges, addNotification]);

  const createEdge = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const color = NODE_TYPE_COLORS[sourceNode?.type] || '#3b82f6';
    
    return {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: 'laser',
      animated: liveMode,
      data: { active: liveMode, color },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    };
  }, [nodes, liveMode]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return null;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getNodeDefaults(type),
    };

    setNodes((nds) => nds.concat(newNode));
    return newNode;
  }, [reactFlowInstance, setNodes]);

  const autoLayout = useCallback(() => {
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 4) * 250 + 100,
        y: Math.floor(index / 4) * 150 + 100,
      },
    }));
    setNodes(layoutedNodes);
  }, [nodes, setNodes]);

  const toggleLiveMode = useCallback((newLiveMode) => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: newLiveMode,
        data: { ...edge.data, active: newLiveMode },
      }))
    );
  }, [setEdges]);

  const autoGenerate = useCallback(({ topics, connections }) => {
    const monitoredTopics = topics.filter(t => t.monitored);

    if (monitoredTopics.length === 0) {
      addNotification?.({
        type: 'warning',
        title: 'No monitored topics',
        message: 'Enable monitoring on some topics first',
      });
      return { nodes: [], edges: [] };
    }

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
          markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
        });
      });

      yOffset += (connectionTopics.length + 1) * 100 + 50;
    });

    return { nodes: newNodes, edges: newEdges };
  }, [liveMode, addNotification]);

  return {
    updateNodeData,
    deleteNode,
    deleteSelectedNodes,
    createEdge,
    handleDrop,
    autoLayout,
    toggleLiveMode,
    autoGenerate,
  };
}