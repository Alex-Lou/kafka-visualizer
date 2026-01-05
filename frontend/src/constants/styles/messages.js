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
  
  // Message item
  MESSAGE_ITEM: 'px-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-b-0 cursor-pointer transition-colors',
  MESSAGE_ITEM_DEFAULT: 'hover:bg-surface-50 dark:hover:bg-surface-850',
  MESSAGE_ITEM_SELECTED: 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-500',
  
  MESSAGE_ITEM_HEADER: 'flex items-center justify-between mb-1.5',
  MESSAGE_ITEM_KEY: 'font-mono text-sm font-medium text-surface-900 dark:text-white truncate',
  MESSAGE_ITEM_TIME: 'text-xs text-surface-400 dark:text-surface-500 flex-shrink-0 ml-2',
  
  MESSAGE_ITEM_PREVIEW: 'text-sm text-surface-600 dark:text-surface-400 truncate font-mono',
  
  MESSAGE_ITEM_FOOTER: 'flex items-center gap-2 mt-2',
  MESSAGE_ITEM_BADGE: 'text-xs px-2 py-0.5 rounded-full font-medium',
  MESSAGE_ITEM_BADGE_INBOUND: 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300',
  MESSAGE_ITEM_BADGE_OUTBOUND: 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300',
  
  // Detail panel
  DETAIL_PANEL: 'flex-1',
  DETAIL_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden',
  DETAIL_HEADER: 'px-5 py-4 border-b border-surface-200 dark:border-surface-800',
  DETAIL_HEADER_TOP: 'flex items-center justify-between mb-2',
  DETAIL_TITLE: 'font-semibold text-surface-900 dark:text-white',
  DETAIL_ACTIONS: 'flex items-center gap-2',
  DETAIL_ACTION_BTN: 'p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
  
  DETAIL_META: 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-surface-500 dark:text-surface-400',
  DETAIL_META_ITEM: 'flex items-center gap-1.5',
  
  DETAIL_BODY: 'p-5',
  DETAIL_SECTION: 'mb-6 last:mb-0',
  DETAIL_SECTION_TITLE: 'text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2',
  
  // JSON viewer
  JSON_VIEWER: 'bg-surface-900 dark:bg-surface-950 rounded-xl p-4 font-mono text-sm overflow-x-auto',
  JSON_KEY: 'text-accent-400',
  JSON_STRING: 'text-success-400',
  JSON_NUMBER: 'text-warning-400',
  JSON_BOOLEAN: 'text-secondary-400',
  JSON_NULL: 'text-surface-500',
  JSON_BRACKET: 'text-surface-400',
  
  // Headers table
  HEADERS_TABLE: 'w-full text-sm',
  HEADERS_TH: 'text-left py-2 px-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-800',
  HEADERS_TD: 'py-2 px-3 border-b border-surface-100 dark:border-surface-800',
  HEADERS_TD_KEY: 'font-medium text-surface-700 dark:text-surface-300',
  HEADERS_TD_VALUE: 'text-surface-600 dark:text-surface-400 font-mono',
  
  // Empty state
  EMPTY_STATE: 'flex flex-col items-center justify-center py-16 text-center',
  EMPTY_STATE_ICON: 'w-16 h-16 text-surface-300 dark:text-surface-600 mb-4',
  EMPTY_STATE_TEXT: 'text-surface-500 dark:text-surface-400',
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
