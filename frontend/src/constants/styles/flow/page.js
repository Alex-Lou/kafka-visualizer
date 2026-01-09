// Flow page specific styles
export const PAGE = {
  // Main container
  PAGE_CONTAINER: 'h-[calc(100vh-10rem)] flex flex-col',

  // Toolbar
  TOOLBAR: 'bg-card border border-border rounded-lg p-3 mb-4 flex items-center justify-between',
  TOOLBAR_SECTION: 'flex items-center gap-2',
  TOOLBAR_DIVIDER: 'w-px h-6 bg-border mx-1',

  // Mode Toggles (Selection, Live)
  MODE_TOGGLE_GROUP: 'flex items-center bg-muted rounded-lg p-1',
  MODE_TOGGLE_BTN: 'p-2 rounded-md transition-colors',
  MODE_TOGGLE_BTN_ACTIVE: 'bg-background text-primary shadow-sm',
  MODE_TOGGLE_BTN_INACTIVE: 'text-muted-foreground hover:text-foreground',

  LIVE_TOGGLE_WRAPPER: 'flex items-center gap-2',
  LIVE_TOGGLE_LABEL: 'text-sm text-muted-foreground',
  LIVE_TOGGLE: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
  LIVE_TOGGLE_BG_ON: 'bg-success-500',
  LIVE_TOGGLE_BG_OFF: 'bg-muted-foreground/50',
  LIVE_TOGGLE_KNOB: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
  LIVE_TOGGLE_KNOB_ON: 'translate-x-6',
  LIVE_TOGGLE_KNOB_OFF: 'translate-x-1',

  // Meta info
  META_INFO: 'text-sm text-muted-foreground',
  HISTORY_INFO: 'flex items-center gap-1 text-xs text-muted-foreground',
  HISTORY_ICON: 'w-3 h-3',

  // Canvas
  CANVAS_WRAPPER: 'flex-1 bg-background rounded-lg border border-border overflow-hidden relative',

  // React Flow Customization
  CONTROLS: 'bg-card border border-border rounded-lg [&>button]:border-border',
  MINIMAP: '!bg-black !border-0 rounded-lg',

  // Hint bar
  HINT_BAR: 'mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground',
  HINT_KBD: 'px-1.5 py-0.5 bg-muted rounded',
};
