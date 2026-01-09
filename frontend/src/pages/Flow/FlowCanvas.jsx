import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  MiniMap, 
  Background, 
  Panel, 
  MarkerType, 
  SelectionMode, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FLOW as STYLES } from '@constants/styles/flow';
import { nodeTypes } from '@components/flow/nodes';
import { edgeTypes } from '@components/flow/edges';
import { NodeEditPanel, NodePalette, ClusterControlPanel, TopicControlPanel } from '@components/flow/panels';
import { NODE_TYPE_COLORS, getNodeDefaults, STATUS, STATUS_COLORS } from '@components/flow/constants';
import { useTopicStore } from '@context/store/index';

export function FlowCanvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  liveMode,
  selectionMode,
  addNode,
  updateNodeData,
  deleteNode,
  saveToHistory,
  onInit
}) {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [controlPanelNode, setControlPanelNode] = useState(null);
  const topicStore = useTopicStore();
  
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const liveModeRef = useRef(liveMode);
  const isDraggingRef = useRef(false);
  
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    liveModeRef.current = liveMode;
  }, [nodes, edges, liveMode]);

  // ============================================================
  // React Flow Callbacks
  // ============================================================

  const onNodesChange = useCallback((changes) => {
    setNodes(applyNodeChanges(changes, nodesRef.current));
  }, [setNodes]);

  const onEdgesChange = useCallback((changes) => {
    setEdges(applyEdgeChanges(changes, edgesRef.current));
  }, [setEdges]);

  const onNodeDragStart = useCallback((event, node) => {
    if (!isDraggingRef.current && saveToHistory) {
      saveToHistory();
      isDraggingRef.current = true;
    }
  }, [saveToHistory]);

  const onNodeDragStop = useCallback((event, node) => {
    isDraggingRef.current = false;
  }, []);

  // ============================================================
  // 🆕 Delete Edge Handler
  // ============================================================

  const deleteEdge = useCallback((edgeId) => {
    if (saveToHistory) {
      saveToHistory();
    }
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges, saveToHistory]);

  // ============================================================
  // Connect Handler
  // ============================================================

  const onConnect = useCallback((params) => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    
    const sourceNode = currentNodes.find(n => n.id === params.source);
    const targetNode = currentNodes.find(n => n.id === params.target);
    const color = NODE_TYPE_COLORS[sourceNode?.type] || '#3b82f6';
    
    let edgeStatus = STATUS.ACTIVE;
    
    if (sourceNode?.data?.status === STATUS.ERROR || targetNode?.data?.status === STATUS.ERROR) {
      edgeStatus = STATUS.ERROR;
    } else if (sourceNode?.data?.status === STATUS.WARNING || targetNode?.data?.status === STATUS.WARNING) {
      edgeStatus = STATUS.WARNING;
    } else if (sourceNode?.data?.status === STATUS.CONNECTING || targetNode?.data?.status === STATUS.CONNECTING) {
      edgeStatus = STATUS.CONNECTING;
    } else {
      const topicNode = [sourceNode, targetNode].find(n => n?.type === 'topic');
      if (topicNode && !topicNode.data?.monitored) {
        edgeStatus = STATUS.UNMONITORED;
      } else {
        const sourceHasActivity = sourceNode?.type === 'topic' 
          ? ((sourceNode?.data?.messageCount || 0) > 0 || (sourceNode?.data?.throughput || 0) > 0)
          : true;
          
        const targetHasActivity = targetNode?.type === 'topic'
          ? ((targetNode?.data?.messageCount || 0) > 0 || (targetNode?.data?.throughput || 0) > 0)
          : true;
        
        if (!sourceHasActivity || !targetHasActivity) {
          edgeStatus = STATUS.INACTIVE;
        }
      }
    }
    
    const statusColor = STATUS_COLORS[edgeStatus];
    
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: 'laser',
      animated: edgeStatus === STATUS.ACTIVE || edgeStatus === STATUS.CONNECTED,
      data: { 
        status: edgeStatus,
        active: edgeStatus !== STATUS.INACTIVE && edgeStatus !== STATUS.UNMONITORED,
        color: statusColor
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: statusColor }
    };
    
    setEdges(addEdge(newEdge, currentEdges));
  }, [setEdges]);

  // ============================================================
  // Drag & Drop Handlers
  // ============================================================

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNode({ id: `${type}-${Date.now()}`, type, position, data: getNodeDefaults(type) });
  }, [reactFlowInstance, addNode]);

  // ============================================================
  // Init & Node Interaction Handlers
  // ============================================================

  const handleInit = (instance) => {
    setReactFlowInstance(instance);
    if (onInit) onInit(instance);
  };

  const handleNodeDoubleClick = useCallback((event, node) => {
    if (node.type === 'application') {
      setControlPanelNode(node);
      setSelectedNode(null);
    } else if (node.type === 'topic') {
      setControlPanelNode(node);
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
      setControlPanelNode(null);
    }
  }, []);

  // ============================================================
  // Topic Status Calculation Helper
  // ============================================================

  const calculateTopicStatus = (monitored, messageCount = 0, throughput = 0) => {
    if (!monitored) {
      return STATUS.UNMONITORED;
    }
    
    const hasActivity = messageCount > 0 || throughput > 0;
    if (hasActivity) {
      return STATUS.ACTIVE;
    }
    
    return STATUS.CONNECTED;
  };

  // ============================================================
  // Toggle Monitor Handler
  // ============================================================

  const handleToggleMonitor = async (topicId) => {
    try {
      await topicStore.toggleTopicMonitoring(topicId);
      
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      const currentLiveMode = liveModeRef.current;
      
      const targetNode = currentNodes.find(
        node => node.type === 'topic' && node.data.topicId === topicId
      );
      
      if (!targetNode) {
        console.warn('Node not found for topicId:', topicId);
        return true;
      }

      const newMonitored = !targetNode.data.monitored;
      
      const newStatus = calculateTopicStatus(
        newMonitored,
        targetNode.data.messageCount || 0,
        targetNode.data.throughput || 0
      );

      const newStatusColor = STATUS_COLORS[newStatus];

      const updatedNodes = currentNodes.map(node => {
        if (node.type === 'topic' && node.data.topicId === topicId) {
          return {
            ...node,
            data: {
              ...node.data,
              monitored: newMonitored,
              status: newStatus,
            }
          };
        }
        return node;
      });

      const updatedEdges = currentEdges.map(edge => {
        if (edge.source === targetNode.id || edge.target === targetNode.id) {
          const shouldAnimate = currentLiveMode && 
            (newStatus === STATUS.ACTIVE || newStatus === STATUS.CONNECTED);
          
          return {
            ...edge,
            animated: shouldAnimate,
            data: {
              ...edge.data,
              status: newStatus,
              active: newStatus !== STATUS.INACTIVE && newStatus !== STATUS.UNMONITORED,
              color: newStatusColor,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: newStatusColor,
            },
          };
        }
        return edge;
      });

      setNodes(updatedNodes);
      setEdges(updatedEdges);

      if (controlPanelNode && controlPanelNode.data.topicId === topicId) {
        setControlPanelNode({
          ...controlPanelNode,
          data: {
            ...controlPanelNode.data,
            monitored: newMonitored,
            status: newStatus,
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
      throw error;
    }
  };

  // ============================================================
  // Panel Handlers
  // ============================================================

  const handleCloseControlPanel = () => {
    setControlPanelNode(null);
  };

  const handleUpdateFromPanel = (nodeId, newData) => {
    if (newData && Object.keys(newData).length > 0) {
      updateNodeData(nodeId, newData);
    }
    setControlPanelNode(null);
  };

  const handleDeleteFromPanel = (nodeId) => {
    deleteNode(nodeId);
    setControlPanelNode(null);
  };

  // ============================================================
  // 🆕 Prepare edges with delete handler
  // ============================================================

  const edgesWithDelete = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      onDelete: deleteEdge,
    },
  }));

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={STYLES.CANVAS_WRAPPER}>
      <ReactFlow
        nodes={nodes}
        edges={edgesWithDelete}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={handleInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        selectionMode={selectionMode ? SelectionMode.Partial : SelectionMode.Full}
        panOnDrag={!selectionMode}
        selectionOnDrag={selectionMode}
        selectNodesOnDrag={selectionMode}
        defaultEdgeOptions={{
          type: 'laser',
          animated: liveMode,
          data: { active: liveMode },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
        }}
      >
        <Background color="#6b7280" gap={20} size={1} />
        <Controls className={STYLES.CONTROLS} />
        <MiniMap 
          className={STYLES.MINIMAP} 
          nodeColor={(n) => NODE_TYPE_COLORS[n.type] || '#6b7280'} 
          maskColor="rgba(0, 0, 0, 0.7)"
        />
        <Panel position="bottom-left">
          <NodePalette onDragStart={onDragStart} />
        </Panel>
      </ReactFlow>

      {controlPanelNode?.type === 'application' && (
        <ClusterControlPanel
          node={controlPanelNode}
          onClose={handleCloseControlPanel}
          onUpdate={handleUpdateFromPanel}
          onDelete={handleDeleteFromPanel}
        />
      )}

      {controlPanelNode?.type === 'topic' && (
        <TopicControlPanel
          node={controlPanelNode}
          onClose={handleCloseControlPanel}
          onUpdate={handleUpdateFromPanel}
          onDelete={handleDeleteFromPanel}
          onToggleMonitor={handleToggleMonitor}
        />
      )}

      {selectedNode && (
        <NodeEditPanel
          node={selectedNode}
          onUpdate={(id, data) => { 
            updateNodeData(id, data); 
            setSelectedNode(null); 
          }}
          onDelete={(id) => { 
            deleteNode(id); 
            setSelectedNode(null); 
          }}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

export default FlowCanvas;