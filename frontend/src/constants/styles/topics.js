// Topics page specific styles
export const TOPICS = {
  // Page header
  PAGE_HEADER: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
  PAGE_TITLE: 'text-2xl font-semibold text-surface-900 dark:text-white',
  PAGE_SUBTITLE: 'text-sm text-surface-500 dark:text-surface-400 mt-1',
  
  // Search and filters
  FILTERS_CONTAINER: 'flex flex-col sm:flex-row gap-3 mb-6',
  SEARCH_WRAPPER: 'relative flex-1',
  SEARCH_ICON: 'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400',
  SEARCH_INPUT: 'w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
  FILTER_BTN: 'px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors flex items-center gap-2',
  
  // Topics grid
  TOPICS_GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  
  // Topic card
  TOPIC_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 hover:shadow-lg transition-all duration-300 overflow-hidden',
  TOPIC_CARD_HEADER: 'p-4 flex items-start gap-3',
  TOPIC_CARD_COLOR_BAR: 'absolute top-0 left-0 right-0 h-1',
  TOPIC_CARD_ICON: 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  TOPIC_CARD_ICON_BG: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
  TOPIC_CARD_CONTENT: 'flex-1 min-w-0',
  TOPIC_CARD_NAME: 'font-semibold text-surface-900 dark:text-white truncate',
  TOPIC_CARD_CONNECTION: 'text-xs text-surface-500 dark:text-surface-400 mt-0.5',
  
  TOPIC_CARD_BODY: 'px-4 pb-4',
  TOPIC_CARD_DESCRIPTION: 'text-sm text-surface-600 dark:text-surface-400 line-clamp-2 mb-3',
  
  TOPIC_CARD_STATS: 'flex items-center gap-4 text-sm',
  TOPIC_CARD_STAT: 'flex items-center gap-1.5 text-surface-500 dark:text-surface-400',
  TOPIC_CARD_STAT_VALUE: 'font-medium text-surface-700 dark:text-surface-300',
  
  TOPIC_CARD_FOOTER: 'px-4 py-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between',
  TOPIC_CARD_BADGES: 'flex items-center gap-2',
  TOPIC_CARD_ACTIONS: 'flex items-center gap-1',
  TOPIC_CARD_ACTION_BTN: 'p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
  
  // Empty state
  EMPTY_STATE: 'text-center py-16',
  EMPTY_STATE_ICON: 'w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600',
  EMPTY_STATE_TITLE: 'text-lg font-medium text-surface-900 dark:text-white mb-2',
  EMPTY_STATE_TEXT: 'text-surface-500 dark:text-surface-400 mb-6',
  
  // Loading state
  LOADING_SKELETON: 'animate-pulse bg-surface-200 dark:bg-surface-700 rounded',
}

export const TOPIC_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
]
