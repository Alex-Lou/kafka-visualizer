// Flow visualizer specific styles
export const FLOW = {
  // Container
  CONTAINER: 'h-[calc(100vh-8rem)] flex flex-col',
  
  // Toolbar
  TOOLBAR: 'bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-2 mb-4 flex items-center justify-between',
  TOOLBAR_GROUP: 'flex items-center gap-1',
  TOOLBAR_SEPARATOR: 'w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2',
  TOOLBAR_BTN: 'p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
  TOOLBAR_BTN_ACTIVE: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
  
  // Canvas
  CANVAS: 'flex-1 bg-surface-50 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden',
  CANVAS_INNER: 'w-full h-full',
  
  // Grid background
  GRID_PATTERN: 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]',
  
  // Minimap
  MINIMAP: 'absolute bottom-4 right-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-lg overflow-hidden',
  
  // Controls
  CONTROLS: 'absolute top-4 left-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-lg p-1 flex flex-col gap-1',
  CONTROL_BTN: 'p-2 rounded-md text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors',
  
  // Panel (sidebar)
  PANEL: 'absolute top-4 right-4 w-80 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden',
  PANEL_HEADER: 'px-4 py-3 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between',
  PANEL_TITLE: 'font-semibold text-surface-900 dark:text-white',
  PANEL_CLOSE: 'p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
  PANEL_BODY: 'p-4 max-h-96 overflow-y-auto',
  
  // Node palette
  PALETTE: 'absolute bottom-4 left-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-lg p-3',
  PALETTE_TITLE: 'text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2',
  PALETTE_ITEMS: 'flex gap-2',
  PALETTE_ITEM: 'w-14 h-14 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
  PALETTE_ITEM_ICON: 'w-5 h-5 text-surface-500 dark:text-surface-400 mb-1',
  PALETTE_ITEM_LABEL: 'text-[10px] text-surface-500 dark:text-surface-400',
}

export const FLOW_NODES = {
  // Application node
  APPLICATION: {
    CONTAINER: 'px-4 py-3 rounded-xl border-2 min-w-[140px] transition-all duration-200',
    CONTAINER_DEFAULT: 'bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600 shadow-md hover:shadow-lg',
    CONTAINER_SELECTED: 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 shadow-glow',
    ICON_WRAPPER: 'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
    ICON_WRAPPER_BG: 'bg-primary-100 dark:bg-primary-900/50',
    ICON: 'w-5 h-5 text-primary-600 dark:text-primary-400',
    LABEL: 'text-sm font-medium text-surface-900 dark:text-white text-center',
    SUBLABEL: 'text-xs text-surface-500 dark:text-surface-400 text-center',
  },
  
  // Topic node
  TOPIC: {
    CONTAINER: 'px-4 py-3 rounded-xl border-2 min-w-[120px] transition-all duration-200',
    CONTAINER_DEFAULT: 'bg-accent-50 dark:bg-accent-900/30 border-accent-400 dark:border-accent-600 shadow-md hover:shadow-lg',
    CONTAINER_SELECTED: 'bg-accent-100 dark:bg-accent-900/50 border-accent-500 shadow-glow-accent',
    ICON_WRAPPER: 'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
    ICON_WRAPPER_BG: 'bg-accent-200 dark:bg-accent-800',
    ICON: 'w-5 h-5 text-accent-600 dark:text-accent-400',
    LABEL: 'text-sm font-medium text-surface-900 dark:text-white text-center',
    MESSAGE_COUNT: 'text-xs text-accent-600 dark:text-accent-400 text-center mt-1',
  },
  
  // Consumer group node
  CONSUMER_GROUP: {
    CONTAINER: 'px-4 py-3 rounded-xl border-2 min-w-[140px] transition-all duration-200',
    CONTAINER_DEFAULT: 'bg-secondary-50 dark:bg-secondary-900/30 border-secondary-400 dark:border-secondary-600 shadow-md hover:shadow-lg',
    CONTAINER_SELECTED: 'bg-secondary-100 dark:bg-secondary-900/50 border-secondary-500 shadow-glow-secondary',
    ICON_WRAPPER: 'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
    ICON_WRAPPER_BG: 'bg-secondary-200 dark:bg-secondary-800',
    ICON: 'w-5 h-5 text-secondary-600 dark:text-secondary-400',
    LABEL: 'text-sm font-medium text-surface-900 dark:text-white text-center',
    MEMBERS: 'text-xs text-secondary-600 dark:text-secondary-400 text-center mt-1',
  },
}

export const FLOW_EDGES = {
  DEFAULT: 'stroke-surface-400 dark:stroke-surface-500',
  SELECTED: 'stroke-primary-500',
  ANIMATED: 'stroke-primary-500 animate-flow',
  LABEL_BG: 'fill-white dark:fill-surface-800',
  LABEL_TEXT: 'fill-surface-600 dark:fill-surface-400 text-xs',
}
