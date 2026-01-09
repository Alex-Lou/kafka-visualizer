import { Wand2, LayoutGrid, Undo2, Redo2, Download, History, Hand, MousePointer2, CloudOff, Cloud } from 'lucide-react';
import { Button } from '@components/common';
import { FLOW as STYLES } from '@constants/styles/flow';

export function FlowToolbar({
  onAutoGenerate,
  onAutoLayout,
  onUndo,
  onRedo, // 🆕
  onExportPDF,
  canUndo,
  canRedo, // 🆕
  historyCount,
  redoCount, // 🆕
  selectionMode,
  setSelectionMode,
  liveMode,
  setLiveMode,
  nodesCount,
  edgesCount,
  isExporting,
  // 🆕 Auto-save props
  autoSaveEnabled,
  setAutoSaveEnabled,
  lastAutoSave,
}) {
  // Format last auto-save time
  const formatLastSave = (isoString) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const lastSaveTime = formatLastSave(lastAutoSave);

  return (
    <div className={STYLES.TOOLBAR}>
      <div className={STYLES.TOOLBAR_SECTION}>
        <Button variant="primary" size="sm" icon={Wand2} onClick={onAutoGenerate}>
          Auto Generate
        </Button>
        <div className={STYLES.TOOLBAR_DIVIDER} />
        <Button variant="secondary" size="sm" icon={LayoutGrid} onClick={onAutoLayout}>
          Auto Layout
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Undo2}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Redo2}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          Redo
        </Button>
        <div className={STYLES.TOOLBAR_DIVIDER} />
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onExportPDF}
          isLoading={isExporting}
        >
          Export PDF
        </Button>
      </div>

      <div className={STYLES.TOOLBAR_SECTION}>
        {(historyCount > 0 || redoCount > 0) && (
          <div className={STYLES.HISTORY_INFO}>
            <History className={STYLES.HISTORY_ICON} />
            <span>
              {historyCount > 0 && `${historyCount} undo${historyCount > 1 ? 's' : ''}`}
              {historyCount > 0 && redoCount > 0 && ' • '}
              {redoCount > 0 && `${redoCount} redo${redoCount > 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        <div className={STYLES.MODE_TOGGLE_GROUP}>
          <button
            onClick={() => setSelectionMode(false)}
            className={`${STYLES.MODE_TOGGLE_BTN} ${!selectionMode ? STYLES.MODE_TOGGLE_BTN_ACTIVE : STYLES.MODE_TOGGLE_BTN_INACTIVE}`}
            title="Pan mode"
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectionMode(true)}
            className={`${STYLES.MODE_TOGGLE_BTN} ${selectionMode ? STYLES.MODE_TOGGLE_BTN_ACTIVE : STYLES.MODE_TOGGLE_BTN_INACTIVE}`}
            title="Selection mode [S]"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
        </div>

        <div className={STYLES.TOOLBAR_DIVIDER} />

        {/* Live Mode Toggle */}
        <div className={STYLES.LIVE_TOGGLE_WRAPPER}>
          <span className={STYLES.LIVE_TOGGLE_LABEL}>Live</span>
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`${STYLES.LIVE_TOGGLE} ${liveMode ? STYLES.LIVE_TOGGLE_BG_ON : STYLES.LIVE_TOGGLE_BG_OFF}`}
          >
            <span className={`${STYLES.LIVE_TOGGLE_KNOB} ${liveMode ? STYLES.LIVE_TOGGLE_KNOB_ON : STYLES.LIVE_TOGGLE_KNOB_OFF}`} />
          </button>
        </div>

        <div className={STYLES.TOOLBAR_DIVIDER} />

        {/* 🆕 Auto-Save Toggle */}
        <div className={STYLES.LIVE_TOGGLE_WRAPPER}>
          <div className="flex items-center gap-1.5">
            {autoSaveEnabled ? (
              <Cloud className="w-3.5 h-3.5 text-success-500" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className={STYLES.LIVE_TOGGLE_LABEL}>Auto-save</span>
          </div>
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`${STYLES.LIVE_TOGGLE} ${autoSaveEnabled ? 'bg-success-500' : STYLES.LIVE_TOGGLE_BG_OFF}`}
            title={autoSaveEnabled ? 'Auto-save enabled (every 30s)' : 'Auto-save disabled'}
          >
            <span className={`${STYLES.LIVE_TOGGLE_KNOB} ${autoSaveEnabled ? STYLES.LIVE_TOGGLE_KNOB_ON : STYLES.LIVE_TOGGLE_KNOB_OFF}`} />
          </button>
        </div>

        {/* Last auto-save indicator */}
        {autoSaveEnabled && lastSaveTime && (
          <span className="text-xs text-muted-foreground ml-1">
            saved {lastSaveTime}
          </span>
        )}

        <div className={STYLES.TOOLBAR_DIVIDER} />

        <div className={STYLES.META_INFO}>
          {nodesCount} nodes • {edgesCount} connections
        </div>
      </div>
    </div>
  );
}