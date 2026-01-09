import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { Header, Button, Badge } from '@components/common';
import { useTopicStore, useConnectionStore, useUIStore } from '@context/store/index';
import { useFlowStore } from '@context/flow';
import { useFlowRealtimeUpdates } from '@hooks/useFlowRealtimeUpdates';
import { Save, FolderOpen, Cloud } from 'lucide-react';
import { LAYOUT } from '@constants/styles/layout';
import { FLOW as STYLES } from '@constants/styles/flow';

import { AutoGenerateModal, FlowListModal } from '@components/flow/modals';
import { FlowToolbar } from './FlowToolbar';
import { FlowCanvas } from './FlowCanvas';

export default function FlowPage() {
  const flowWrapperRef = useRef(null);
  
  // Stores
  const { topics, fetchAllTopics } = useTopicStore();
  const { connections } = useConnectionStore();
  const { wsConnected, addNotification } = useUIStore();
  const {
    nodes, edges, currentFlow, liveMode, historyStack, redoStack, flows, isSaving, hasUnsavedChanges,
    setNodes, setEdges, setLiveMode, updateNodeData, deleteNode, deleteSelectedNodes, addNode,
    undo, redo, autoGenerate, autoLayout, fetchFlows, saveFlow, loadFlow, deleteFlow, newFlow,
    saveToHistory,
    autoSaveEnabled, setAutoSaveEnabled, lastAutoSave,
  } = useFlowStore();

  // Local State
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [showFlowList, setShowFlowList] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Realtime updates
  useFlowRealtimeUpdates(liveMode && wsConnected);

  // Initial Load
  useEffect(() => {
    fetchAllTopics();
    fetchFlows();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.closest('input, textarea')) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const count = deleteSelectedNodes();
        if (count > 0) addNotification({ type: 'success', title: 'Deleted', message: `Removed ${count} node(s)` });
      }
      
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        setSelectionMode(prev => !prev);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes, addNotification]);

  // Handlers
  const handleUndo = () => {
    if (undo()) addNotification({ type: 'success', title: 'Undone', message: 'Restored previous layout' });
    else addNotification({ type: 'info', title: 'Nothing to undo' });
  };

  const handleRedo = () => {
    if (redo()) addNotification({ type: 'success', title: 'Redone', message: 'Restored next layout' });
    else addNotification({ type: 'info', title: 'Nothing to redo' });
  };

  const handleAutoGenerate = (selectedConnectionIds) => {
    // Filtrer uniquement les connexions sélectionnées par l'utilisateur
    const selectedConnections = connections.filter(c => 
      selectedConnectionIds.includes(c.id)
    );
    
    // Filtrer les topics appartenant aux connexions sélectionnées
    const selectedTopics = topics.filter(t => 
      selectedConnectionIds.includes(t.connectionId)
    );
    
    const result = autoGenerate(selectedTopics, selectedConnections, liveMode);
    
    if (result.success) {
      setShowAutoGenerate(false);
      addNotification({ 
        type: 'success', 
        title: 'Flow generated', 
        message: `Created ${result.nodesCount} nodes and ${result.edgesCount} connections` 
      });
    } else {
      addNotification({ 
        type: 'warning', 
        title: 'Cannot generate', 
        message: result.message 
      });
    }
  };

  const handleAutoLayout = () => {
    autoLayout();
    addNotification({ type: 'success', title: 'Layout updated', message: 'Press Ctrl+Z to undo' });
  };

  const handleSave = async () => {
    if (nodes.length === 0) {
      addNotification({ type: 'warning', title: 'Nothing to save', message: 'Add some nodes first' });
      return;
    }
    try {
      await saveFlow();
      addNotification({ type: 'success', title: 'Saved', message: 'Flow diagram saved to database' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Save failed', message: error.message });
    }
  };

  const handleExportPDF = async () => {
    if (!flowWrapperRef.current) return;
    setIsExporting(true);
    try {
      const element = flowWrapperRef.current.querySelector('.react-flow__viewport');
      if (!element) throw new Error('Flow viewport not found');
      
      const dataUrl = await toPng(element, { backgroundColor: '#1a1a2e', quality: 1, pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] });
      
      pdf.setFontSize(24).setTextColor(255, 255, 255).text(currentFlow?.name || 'Flow Diagram', 40, 50);
      pdf.setFontSize(12).setTextColor(150, 150, 150).text(`Exported: ${new Date().toLocaleString()}`, 40, 70);
      pdf.addImage(dataUrl, 'PNG', 40, 100, 1120, 650);
      pdf.setFontSize(10).text('Generated by Kafka Flow Visualizer', 40, 780);
      pdf.save(`${currentFlow?.name || 'flow-diagram'}.pdf`);
      
      addNotification({ type: 'success', title: 'Exported', message: 'PDF downloaded successfully' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Export failed', message: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadFlow = (flow) => { loadFlow(flow); setShowFlowList(false); };
  const handleNewFlow = () => { newFlow(); setShowFlowList(false); };
  const handleDeleteFlow = async (id) => {
    try {
      await deleteFlow(id);
      addNotification({ type: 'success', title: 'Deleted', message: 'Flow diagram removed' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Delete failed', message: error.message });
    }
  };

  const handleAutoSaveToggle = (enabled) => {
    setAutoSaveEnabled(enabled);
    if (enabled) {
      addNotification({ type: 'success', title: 'Auto-save enabled', message: 'Your flow will be saved every 30 seconds' });
    } else {
      addNotification({ type: 'info', title: 'Auto-save disabled', message: 'Remember to save manually' });
    }
  };

  const selectedNodesCount = nodes.filter(n => n.selected).length;

  return (
    <>
      <Header
        title="Flow Visualizer"
        subtitle={currentFlow?.name || 'Untitled Diagram'}
        actions={
          <div className="flex items-center gap-3">
            {autoSaveEnabled && (
              <Badge variant="secondary" size="sm" className="gap-1.5">
                <Cloud className="w-3 h-3" />
                Auto-save
              </Badge>
            )}
            {wsConnected && liveMode && (
              <Badge variant="success" size="sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                Live
              </Badge>
            )}
            {hasUnsavedChanges && <Badge variant="warning" size="sm">Unsaved</Badge>}
            {selectedNodesCount > 0 && <Badge variant="secondary" size="sm">{selectedNodesCount} selected</Badge>}
            <Button variant="secondary" size="sm" icon={FolderOpen} onClick={() => setShowFlowList(true)}>Open</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSave} isLoading={isSaving}>Save</Button>
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={STYLES.PAGE_CONTAINER}>
          <FlowToolbar
            onAutoGenerate={() => setShowAutoGenerate(true)}
            onAutoLayout={handleAutoLayout}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onExportPDF={handleExportPDF}
            canUndo={historyStack.length > 0}
            canRedo={redoStack.length > 0}
            historyCount={historyStack.length}
            redoCount={redoStack.length}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            liveMode={liveMode}
            setLiveMode={setLiveMode}
            nodesCount={nodes.length}
            edgesCount={edges.length}
            isExporting={isExporting}
            autoSaveEnabled={autoSaveEnabled}
            setAutoSaveEnabled={handleAutoSaveToggle}
            lastAutoSave={lastAutoSave}
          />

          <div ref={flowWrapperRef} className="flex-1 flex flex-col overflow-hidden">
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              liveMode={liveMode}
              selectionMode={selectionMode}
              addNode={addNode}
              updateNodeData={updateNodeData}
              deleteNode={deleteNode}
              saveToHistory={saveToHistory}
            />
          </div>

          <div className={STYLES.HINT_BAR}>
            <span><kbd className={STYLES.HINT_KBD}>S</kbd> Toggle selection</span>
            <span><kbd className={STYLES.HINT_KBD}>Del</kbd> Delete</span>
            <span><kbd className={STYLES.HINT_KBD}>Ctrl+S</kbd> Save</span>
            <span><kbd className={STYLES.HINT_KBD}>Ctrl+Z</kbd> Undo</span>
            <span><kbd className={STYLES.HINT_KBD}>Ctrl+Y</kbd> Redo</span>
            <span><kbd className={STYLES.HINT_KBD}>Dbl-click</kbd> Edit</span>
          </div>
        </div>
      </main>

      {showAutoGenerate && <AutoGenerateModal topics={topics} connections={connections} onConfirm={handleAutoGenerate} onCancel={() => setShowAutoGenerate(false)} />}
      {showFlowList && <FlowListModal flows={flows} onSelect={handleLoadFlow} onCreate={handleNewFlow} onDelete={handleDeleteFlow} onClose={() => setShowFlowList(false)} />}
    </>
  );
}