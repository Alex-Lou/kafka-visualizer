// Messages page specific styles
export const MESSAGES = {
  // Container
  CONTAINER: 'flex flex-col lg:flex-row gap-6',
  
  // Messages list panel
  LIST_PANEL: 'w-full lg:w-96 flex-shrink-0',
  LIST_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden',
  LIST_HEADER: 'px-4 py-3 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between',
  LIST_TITLE: 'font-semibold text-surface-900 dark:text-white',
  LIST_COUNT: 'text-sm text-surface-500 dark:text-surface-400',
  
  LIST_FILTERS: 'px-4 py-3 border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-850',
  LIST_FILTER_ROW: 'flex items-center gap-2',
  
  LIST_CONTENT: 'max-h-[600px] overflow-y-auto',
  
  // Topic selector
  TOPIC_SELECT: 'w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm mb-2',
  
  // Search input
  SEARCH_WRAPPER: 'relative mb-2',
  SEARCH_ICON: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400',
  SEARCH_INPUT: 'w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm',

  // Direction filter
  DIRECTION_FILTER_ROW: 'flex items-center gap-2',
  DIRECTION_FILTER_ICON: 'w-4 h-4 text-surface-400',
  DIRECTION_SELECT: 'flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm',

  // Loading state
  LOADING_CONTAINER: 'flex items-center justify-center py-8',
  LOADING_SPINNER: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500',
  
  // Message item
  MESSAGE_ITEM: 'px-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-b-0 cursor-pointer transition-colors',
  MESSAGE_ITEM_DEFAULT: 'hover:bg-surface-50 dark:hover:bg-surface-850',
  MESSAGE_ITEM_SELECTED: 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-500',
  MESSAGE_ITEM_NEW: 'animate-pulse bg-success-50 dark:bg-success-900/20',
  
  MESSAGE_ITEM_HEADER: 'flex items-center justify-between mb-1.5',
  MESSAGE_ITEM_KEY: 'font-mono text-sm font-medium text-surface-900 dark:text-white truncate',
  MESSAGE_ITEM_TIME: 'text-xs text-surface-400 dark:text-surface-500 flex-shrink-0 ml-2',
  
  MESSAGE_ITEM_PREVIEW: 'text-sm text-surface-600 dark:text-surface-400 truncate font-mono',
  
  MESSAGE_ITEM_FOOTER: 'flex items-center gap-2 mt-2',
  MESSAGE_ITEM_BADGE: 'text-xs px-2 py-0.5 rounded-full font-medium',
  MESSAGE_ITEM_BADGE_INBOUND: 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300',
  MESSAGE_ITEM_BADGE_OUTBOUND: 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300',

  // Detail panel
  DETAIL_PANEL: 'flex-1 min-w-0',
  DETAIL_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden',
  DETAIL_HEADER: 'px-5 py-4 border-b border-surface-200 dark:border-surface-800',
  DETAIL_HEADER_TOP: 'flex items-center justify-between mb-2',
  DETAIL_TITLE: 'font-semibold text-surface-900 dark:text-white',
  DETAIL_ACTIONS: 'flex items-center gap-1',
  DETAIL_ACTION_BTN: 'p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
  DETAIL_ACTION_BTN_SUCCESS: 'p-2 rounded-lg text-success-500 bg-success-50 dark:bg-success-900/20',
  
  DETAIL_META: 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-surface-500 dark:text-surface-400',
  DETAIL_META_ITEM: 'flex items-center gap-1.5',
  
  DETAIL_BODY: 'p-5',
  DETAIL_SECTION: 'mb-6 last:mb-0',
  DETAIL_SECTION_TITLE: 'text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2',
  
  // JSON viewer
  JSON_VIEWER: 'bg-surface-900 dark:bg-surface-950 rounded-xl p-4 font-mono text-sm overflow-x-auto',
  JSON_VIEWER_LIGHT: 'bg-surface-50 dark:bg-surface-800 rounded-xl p-4 font-mono text-sm',
  JSON_KEY: 'text-accent-400',
  JSON_STRING: 'text-success-400',
  JSON_NUMBER: 'text-warning-400',
  JSON_BOOLEAN: 'text-secondary-400',
  JSON_NULL: 'text-surface-500',
  JSON_BRACKET: 'text-surface-400',
  JSON_PLAIN: 'text-surface-300',
  
  // Headers table
  HEADERS_TABLE: 'w-full text-sm',
  HEADERS_TABLE_WRAPPER: 'bg-surface-50 dark:bg-surface-800 rounded-xl overflow-hidden',
  HEADERS_TH: 'text-left py-2 px-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-800',
  HEADERS_TD: 'py-2 px-3 border-b border-surface-100 dark:border-surface-800',
  HEADERS_TD_KEY: 'font-medium text-surface-700 dark:text-surface-300',
  HEADERS_TD_VALUE: 'text-surface-600 dark:text-surface-400 font-mono',
  
  // Empty state
  EMPTY_STATE: 'flex flex-col items-center justify-center py-16 text-center',
  EMPTY_STATE_ICON: 'w-16 h-16 text-surface-300 dark:text-surface-600 mb-4',
  EMPTY_STATE_TEXT: 'text-surface-500 dark:text-surface-400',
  EMPTY_STATE_PANEL: 'h-full min-h-[400px] flex flex-col items-center justify-center text-surface-500 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800',
  EMPTY_STATE_PANEL_ICON: 'w-12 h-12 mb-4 text-surface-300 dark:text-surface-600',
  
  // Export buttons
  EXPORT_CONTAINER: 'flex items-center gap-2',
  EXPORT_BTN: 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
  EXPORT_BTN_DROPDOWN: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50',
  EXPORT_MENU: 'absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-10 overflow-hidden',
  EXPORT_MENU_ITEM: 'flex items-center w-full px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700',
  EXPORT_ICON: 'w-3.5 h-3.5',

  // List header with export
  LIST_HEADER_LEFT: 'flex items-center gap-3',
  LIST_HEADER_RIGHT: 'flex items-center gap-2',

  // Modal Styles
  MODAL_OVERLAY: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm',
  MODAL_CARD: 'bg-white dark:bg-surface-900 rounded-xl shadow-xl w-full max-w-md m-4 border border-surface-200 dark:border-surface-800 overflow-hidden',
  MODAL_HEADER: 'px-5 py-4 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center',
  MODAL_TITLE: 'font-semibold text-surface-900 dark:text-white',
  MODAL_CLOSE_BTN: 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors',
  MODAL_BODY: 'p-6 space-y-4',
  MODAL_FOOTER: 'px-5 py-4 bg-surface-50 dark:bg-surface-850 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3',
  MODAL_LABEL: 'text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block',
  MODAL_INPUT: 'w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-700 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all',
  MODAL_TEXTAREA: 'w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-700 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none',
  MODAL_HELP_TEXT: 'text-xs text-surface-500 dark:text-surface-400',

  // Filter Bar Components
  FILTER_SELECT: 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-surface-700 dark:text-surface-300',
  FILTER_BTN: 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200',
  FILTER_BTN_ACTIVE: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500',

  // Icon-only Action Buttons (for Filter Bar)
  FILTER_ICON_BTN: 'p-1.5 rounded-lg border transition-colors flex items-center justify-center',
  FILTER_BTN_ARCHIVE: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50',
  FILTER_BTN_EMAIL: 'bg-primary-100 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50',
}

export const MESSAGE_DIRECTION = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
}

export const MESSAGE_STATUS = {
  RECEIVED: 'RECEIVED',
  PROCESSED: 'PROCESSED',
  ERROR: 'ERROR',
  PENDING: 'PENDING',
}