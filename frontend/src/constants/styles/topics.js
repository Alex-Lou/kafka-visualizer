// Topics page specific styles
export const TOPICS = {
  // Filters Bar
  FILTERS_BAR: 'bg-card border border-border rounded-lg p-4 mb-6',
  FILTERS_GRID: 'flex flex-wrap items-center gap-4',
  SEARCH_WRAPPER: 'relative',
  SEARCH_ICON: 'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground',
  SEARCH_INPUT: 'w-full pl-10 pr-4 py-2 bg-background dark:bg-surface-800 border border-border rounded-lg text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary',
  
  FILTER_SELECT: 'bg-background dark:bg-surface-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary',
  FILTER_BUTTON: 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
  FILTER_BUTTON_ACTIVE: 'bg-primary/10 text-primary',
  FILTER_BUTTON_INACTIVE: 'bg-muted text-muted-foreground hover:bg-muted/80',
  
  RESET_BUTTON: 'flex items-center gap-1 px-2 py-2 text-sm text-muted-foreground hover:text-foreground',
  CLEANUP_BUTTON: 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-auto',
  
  ACTIVE_FILTERS_BAR: 'flex items-center gap-2 mt-3 pt-3 border-t border-border',
  ACTIVE_FILTERS_LABEL: 'text-xs text-muted-foreground',
  ACTIVE_FILTERS_VALUE: 'text-xs font-medium text-foreground',

  // Connection Section
  CONNECTION_CARD: 'overflow-hidden',
  CONNECTION_HEADER: 'w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors',
  CONNECTION_HEADER_LEFT: 'flex items-center gap-4',
  CONNECTION_CHEVRON: 'w-5 h-5 text-muted-foreground',
  CONNECTION_TITLE: 'text-lg font-semibold text-foreground',
  CONNECTION_SUBTITLE: 'text-sm text-muted-foreground',
  CONNECTION_BADGES: 'flex items-center gap-3',

  // Topics Grid
  TOPICS_GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  TOPIC_CARD: 'bg-card border border-border rounded-lg group cursor-pointer hover:shadow-lg transition-shadow',
  TOPIC_CARD_COLOR_BAR: 'h-1.5 rounded-t-lg',
  TOPIC_CARD_HEADER: 'flex items-center gap-3 p-4',
  TOPIC_CARD_ICON: 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
  TOPIC_CARD_ICON_BG: 'bg-muted text-muted-foreground',
  TOPIC_CARD_CONTENT: 'flex-1 min-w-0',
  TOPIC_CARD_NAME: 'font-semibold text-foreground truncate',
  TOPIC_CARD_TIME: 'text-xs text-muted-foreground',
  TOPIC_CARD_MENU_BTN: 'p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity',
  
  TOPIC_CARD_BODY: 'px-4 pb-4',
  TOPIC_CARD_DESCRIPTION: 'text-sm text-muted-foreground mb-3',
  TOPIC_CARD_STATS: 'space-y-1 text-sm',
  TOPIC_CARD_STAT: 'flex justify-between items-center',
  TOPIC_CARD_STAT_VALUE: 'font-medium text-foreground',
  
  TOPIC_CARD_FOOTER: 'px-4 py-3 border-t border-border bg-muted/50 flex justify-between items-center',
  TOPIC_CARD_BADGES: 'flex gap-2',
  TOPIC_CARD_ACTIONS: 'flex gap-1',
  TOPIC_CARD_ACTION_BTN: 'p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md',

  // Empty State
  EMPTY_STATE: 'text-center py-16',
  EMPTY_STATE_ICON: 'w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50',
  EMPTY_STATE_TITLE: 'text-xl font-semibold text-foreground',
  EMPTY_STATE_TEXT: 'text-muted-foreground mt-2',

  // Cleanup Modal
  MODAL_BACKDROP: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
  MODAL_CONTENT: 'bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl',
  MODAL_HEADER: 'flex items-center gap-3 mb-4',
  MODAL_ICON_WRAPPER: 'w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center',
  MODAL_ICON: 'w-5 h-5 text-red-500',
  MODAL_TITLE: 'text-lg font-semibold text-foreground',
  MODAL_TEXT: 'text-muted-foreground mb-4',
  MODAL_NOTE: 'bg-muted rounded-lg p-3 mb-6 text-sm text-muted-foreground',
  MODAL_ACTIONS: 'flex gap-3 justify-end',
  MODAL_DELETE_BTN: 'bg-red-600 hover:bg-red-700 text-white',
};
