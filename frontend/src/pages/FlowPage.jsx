import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  Panel,
  MarkerType,
  SelectionMode,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { Header, Button, Badge } from '@components/common';
import { useTopicStore, useConnectionStore, useUIStore } from '@context/store';
import { useFlowStore } from '@context/flowStore';
import {
  Save,
  LayoutGrid,
  FolderOpen,
  Wand2,
  Download,
  MousePointer2,
  Hand,
  Undo2,
  History,
} from 'lucide-react';
import { LAYOUT } from '@constants/styles/layout';

// Flow components
import { nodeTypes } from '@components/flow/nodes';
import { edgeTypes } from '@components/flow/edges';
import { NodeEditPanel, NodePalette } from '@components/flow/panels';
import { AutoGenerateModal, FlowListModal } from '@components/flow/modals';
import { NODE_TYPE_COLORS, getNodeDefaults } from '@components/flow/constants';

export default function FlowPage() {
  const flowRef = useRef(null);
  
  // External stores
  const { topics, fetchAllTopics } = useTopicStore();
  const { connections } = useConnectionStore();
  const { wsConnected, addNotification } = useUIStore();

  // Flow store (persists during session)
  const {
    nodes,
    edges,
    currentFlow,
    liveMode,
    historyStack,
    flows,
    isSaving,
    hasUnsavedChanges,
    setNodes,
    setEdges,
    setLiveMode,
    updateNodeData,
    deleteNode,
    deleteSelectedNodes,
    addNode,
    addEdge: addEdgeToStore,
    saveToHistory,
    undo,
    autoGenerate,
    autoLayout,
    fetchFlows,
    saveFlow,
    loadFlow,
    deleteFlow,
    newFlow,
  } = useFlowStore();

  // Local UI state
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [showFlowList, setShowFlowList] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load flows from DB on mount
  useEffect(() => {
    fetchAllTopics();
    fetchFlows();
  }, []);

  // Handle nodes changes from React Flow
  const onNodesChange = useCallback((changes) => {
    const newNodes = applyNodeChanges(changes, nodes);
    setNodes(newNodes);
  }, [nodes, setNodes]);

  // Handle edges changes from React Flow
  const onEdgesChange = useCallback((changes) => {
    const newEdges = applyEdgeChanges(changes, edges);
    setEdges(newEdges);
  }, [edges, setEdges]);

  // Handle new connection
  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const color = NODE_TYPE_COLORS[sourceNode?.type] || '#3b82f6';
    
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: 'laser',
      animated: liveMode,
      data: { active: liveMode, color },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    };
    
    const newEdges = addEdge(newEdge, edges);
    setEdges(newEdges);
  }, [nodes, edges, liveMode, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.closest('input, textarea')) return;

      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const count = deleteSelectedNodes();
        if (count > 0) {
          addNotification({
            type: 'success',
            title: 'Deleted',
            message: `Removed ${count} node(s)`,
          });
        }
      }
      
      // Toggle selection mode
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        setSelectionMode(prev => !prev);
      }
      
      // Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes, addNotification]);

  // Handle node double-click for editing
  const onNodeDoubleClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Drag and drop
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

    addNode(newNode);
  }, [reactFlowInstance, addNode]);

  // Actions
  const handleUndo = () => {
    const success = undo();
    if (success) {
      addNotification({
        type: 'success',
        title: 'Undone',
        message: 'Restored previous layout',
      });
    } else {
      addNotification({
        type: 'info',
        title: 'Nothing to undo',
        message: 'No previous state available',
      });
    }
  };

  const handleAutoGenerate = () => {
    const result = autoGenerate(topics, connections, liveMode);
    
    if (result.success) {
      setShowAutoGenerate(false);
      addNotification({
        type: 'success',
        title: 'Flow generated',
        message: `Created ${result.nodesCount} nodes and ${result.edgesCount} connections`,
      });
    } else {
      addNotification({
        type: 'warning',
        title: 'Cannot generate',
        message: result.message,
      });
    }
  };

  const handleAutoLayout = () => {
    autoLayout();
    addNotification({
      type: 'success',
      title: 'Layout updated',
      message: 'Press Ctrl+Z to undo',
    });
  };

  const handleToggleLiveMode = () => {
    setLiveMode(!liveMode);
  };

  const handleSave = async () => {
    if (nodes.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Nothing to save',
        message: 'Add some nodes to your flow first',
      });
      return;
    }

    try {
      await saveFlow();
      addNotification({
        type: 'success',
        title: 'Saved',
        message: 'Flow diagram saved to database',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save failed',
        message: error.message,
      });
    }
  };

  const handleExportPDF = async () => {
    if (!flowRef.current) return;
    
    setIsExporting(true);
    try {
      const element = flowRef.current.querySelector('.react-flow__viewport');
      if (!element) throw new Error('Flow viewport not found');

      const dataUrl = await toPng(element, {
        backgroundColor: '#1a1a2e',
        quality: 1,
        pixelRatio: 2,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 800],
      });

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text(currentFlow?.name || 'Flow Diagram', 40, 50);

      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Exported: ${new Date().toLocaleString()}`, 40, 70);

      pdf.addImage(dataUrl, 'PNG', 40, 100, 1120, 650);

      pdf.setFontSize(10);
      pdf.text('Generated by Kafka Flow Visualizer', 40, 780);

      pdf.save(`${currentFlow?.name || 'flow-diagram'}-${Date.now()}.pdf`);

      addNotification({
        type: 'success',
        title: 'Exported',
        message: 'PDF downloaded successfully',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export failed',
        message: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadFlow = (flow) => {
    loadFlow(flow);
    setShowFlowList(false);
  };

  const handleNewFlow = () => {
    newFlow();
    setShowFlowList(false);
  };

  const handleDeleteFlow = async (id) => {
    try {
      await deleteFlow(id);
      addNotification({
        type: 'success',
        title: 'Deleted',
        message: 'Flow diagram removed',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete failed',
        message: error.message,
      });
    }
  };

  const handleUpdateNode = (nodeId, newData) => {
    updateNodeData(nodeId, newData);
    setSelectedNode(null);
  };

  const handleDeleteNode = (nodeId) => {
    deleteNode(nodeId);
    setSelectedNode(null);
  };

  const selectedNodesCount = nodes.filter(n => n.selected).length;
  const canUndo = historyStack.length > 0;

  return (
    <>
      <Header
        title="Flow Visualizer"
        subtitle={currentFlow?.name || 'Untitled Diagram'}
        actions={
          <div className="flex items-center gap-3">
            {wsConnected && liveMode && (
              <Badge variant="success" size="sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                Live
              </Badge>
            )}
            {hasUnsavedChanges && <Badge variant="warning" size="sm">Unsaved</Badge>}
            {selectedNodesCount > 0 && (
              <Badge variant="secondary" size="sm">{selectedNodesCount} selected</Badge>
            )}
            <Button variant="secondary" size="sm" icon={FolderOpen} onClick={() => setShowFlowList(true)}>
              Open
            </Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSave} isLoading={isSaving}>
              Save
            </Button>
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        <div className="h-[calc(100vh-10rem)] flex flex-col">
          {/* Toolbar */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" icon={Wand2} onClick={() => setShowAutoGenerate(true)}>
                Auto Generate
              </Button>
              <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />
              <Button variant="secondary" size="sm" icon={LayoutGrid} onClick={handleAutoLayout}>
                Auto Layout
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Undo2} 
                onClick={handleUndo}
                disabled={!canUndo}
                className={!canUndo ? 'opacity-50 cursor-not-allowed' : ''}
                title="Undo (Ctrl+Z)"
              >
                Undo
              </Button>
              <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Download} 
                onClick={handleExportPDF}
                isLoading={isExporting}
              >
                Export PDF
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* History indicator */}
              {historyStack.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-surface-500">
                  <History className="w-3 h-3" />
                  <span>{historyStack.length} undo{historyStack.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Selection Mode Toggle */}
              <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
                <button
                  onClick={() => setSelectionMode(false)}
                  className={`p-2 rounded-md transition-colors ${
                    !selectionMode 
                      ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' 
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                  title="Pan mode"
                >
                  <Hand className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectionMode(true)}
                  className={`p-2 rounded-md transition-colors ${
                    selectionMode 
                      ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' 
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                  title="Selection mode [S]"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

              {/* Live Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-600 dark:text-surface-400">Live</span>
                <button
                  onClick={handleToggleLiveMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    liveMode ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    liveMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

              <div className="text-sm text-surface-500 dark:text-surface-400">
                {nodes.length} nodes • {edges.length} connections
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div 
            ref={flowRef}
            className="flex-1 bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden relative"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              selectionMode={selectionMode ? SelectionMode.Partial : SelectionMode.Full}
              panOnDrag={!selectionMode}
              selectionOnDrag={selectionMode}
              selectNodesOnDrag={selectionMode}
              className="bg-surface-50 dark:bg-surface-950"
              defaultEdgeOptions={{
                type: 'laser',
                animated: liveMode,
                data: { active: liveMode },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
              }}
            >
              <Background color="#6b7280" gap={20} size={1} />
              <Controls className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl [&>button]:border-surface-200 dark:[&>button]:border-surface-700" />
              <MiniMap
                className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl"
                nodeColor={(n) => NODE_TYPE_COLORS[n.type] || '#6b7280'}
              />
              <Panel position="bottom-left">
                <NodePalette onDragStart={onDragStart} />
              </Panel>
            </ReactFlow>

            {/* Node Edit Panel */}
            {selectedNode && (
              <NodeEditPanel
                node={selectedNode}
                onUpdate={handleUpdateNode}
                onDelete={handleDeleteNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-surface-500">
            <span><kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">S</kbd> Toggle selection</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">Del</kbd> Delete selected</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">Ctrl+S</kbd> Save</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">Ctrl+Z</kbd> Undo</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">Double-click</kbd> Edit node</span>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAutoGenerate && (
        <AutoGenerateModal
          topics={topics}
          connections={connections}
          onConfirm={handleAutoGenerate}
          onCancel={() => setShowAutoGenerate(false)}
        />
      )}

      {showFlowList && (
        <FlowListModal
          flows={flows}
          onSelect={handleLoadFlow}
          onCreate={handleNewFlow}
          onDelete={handleDeleteFlow}
          onClose={() => setShowFlowList(false)}
        />
      )}
    </>
  );
}