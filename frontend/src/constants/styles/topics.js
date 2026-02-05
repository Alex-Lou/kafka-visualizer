// Topics page specific styles
export const TOPICS = {
  // Filters Bar
  FILTERS_BAR: 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg p-4 mb-6',
  FILTERS_GRID: 'flex flex-wrap items-center gap-4',
  SEARCH_WRAPPER: 'relative flex-1 min-w-[200px]',
  SEARCH_ICON: 'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400',
  SEARCH_INPUT: 'w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200',
  
  FILTER_SELECT: 'bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200',
  FILTER_BUTTON: 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
  FILTER_BUTTON_ACTIVE: 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300',
  FILTER_BUTTON_INACTIVE: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700',
  
  RESET_BUTTON: 'flex items-center gap-1 px-2 py-2 text-sm text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 transition-colors',
  CLEANUP_BUTTON: 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors ml-auto',
  
  ACTIVE_FILTERS_BAR: 'flex items-center gap-2 mt-3 pt-3 border-t border-surface-200 dark:border-surface-800',
  ACTIVE_FILTERS_LABEL: 'text-xs text-surface-500 dark:text-surface-400',
  ACTIVE_FILTERS_VALUE: 'text-xs font-medium text-surface-900 dark:text-surface-100',

  // Connection Section
  CONNECTION_CARD: 'overflow-hidden',
  CONNECTION_HEADER: 'w-full px-6 py-4 flex items-center justify-between hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors',
  CONNECTION_HEADER_LEFT: 'flex items-center gap-4',
  CONNECTION_CHEVRON: 'w-5 h-5 text-surface-500 dark:text-surface-400',
  CONNECTION_TITLE: 'text-lg font-semibold text-surface-900 dark:text-surface-100',
  CONNECTION_SUBTITLE: 'text-sm text-surface-600 dark:text-surface-400',
  CONNECTION_BADGES: 'flex items-center gap-3',

  // Topics Grid
  TOPICS_GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  TOPIC_CARD: 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg group cursor-pointer hover:shadow-lg transition-shadow',
  TOPIC_CARD_COLOR_BAR: 'h-1.5 rounded-t-lg',
  TOPIC_CARD_HEADER: 'flex items-center gap-3 p-4',
  TOPIC_CARD_ICON: 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
  TOPIC_CARD_ICON_BG: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
  TOPIC_CARD_CONTENT: 'flex-1 min-w-0',
  TOPIC_CARD_NAME: 'font-semibold text-surface-900 dark:text-surface-100 truncate',
  TOPIC_CARD_TIME: 'text-xs text-surface-600 dark:text-surface-400',
  TOPIC_CARD_MENU_BTN: 'p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded opacity-0 group-hover:opacity-100 transition-opacity',
  
  TOPIC_CARD_BODY: 'px-4 pb-4',
  TOPIC_CARD_DESCRIPTION: 'text-sm text-surface-600 dark:text-surface-400 mb-3',
  TOPIC_CARD_STATS: 'space-y-1 text-sm',
  TOPIC_CARD_STAT: 'flex justify-between items-center',
  TOPIC_CARD_STAT_VALUE: 'font-medium text-surface-900 dark:text-surface-100',
  
  TOPIC_CARD_FOOTER: 'px-4 py-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 flex justify-between items-center',
  TOPIC_CARD_BADGES: 'flex gap-2',
  TOPIC_CARD_ACTIONS: 'flex gap-1',
  TOPIC_CARD_ACTION_BTN: 'p-1.5 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors',

  // Empty State
  EMPTY_STATE: 'text-center py-16',
  EMPTY_STATE_ICON: 'w-12 h-12 mx-auto mb-4 text-surface-400 dark:text-surface-600 opacity-50',
  EMPTY_STATE_TITLE: 'text-xl font-semibold text-surface-900 dark:text-surface-100',
  EMPTY_STATE_TEXT: 'text-surface-600 dark:text-surface-400 mt-2',

  // Cleanup Modal
  MODAL_BACKDROP: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
  MODAL_CONTENT: 'bg-white dark:bg-surface-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl',
  MODAL_HEADER: 'flex items-center gap-3 mb-4',
  MODAL_ICON_WRAPPER: 'w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center',
  MODAL_ICON: 'w-5 h-5 text-red-500',
  MODAL_TITLE: 'text-lg font-semibold text-surface-900 dark:text-surface-100',
  MODAL_TEXT: 'text-surface-600 dark:text-surface-400 mb-4',
  MODAL_NOTE: 'bg-surface-100 dark:bg-surface-800 rounded-lg p-3 mb-6 text-sm text-surface-600 dark:text-surface-400',
  MODAL_ACTIONS: 'flex gap-3 justify-end',
  MODAL_DELETE_BTN: 'bg-red-600 hover:bg-red-700 text-white',
};
