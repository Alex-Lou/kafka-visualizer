// Dashboard specific styles
export const DASHBOARD = {
  // Stats cards
  STATS_GRID: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
  
  STAT_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 transition-all duration-300 hover:shadow-lg hover:border-primary-500/30',
  STAT_CARD_ICON_WRAPPER: 'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
  STAT_CARD_ICON_PRIMARY: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
  STAT_CARD_ICON_ACCENT: 'bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400',
  STAT_CARD_ICON_SECONDARY: 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-600 dark:text-secondary-400',
  STAT_CARD_ICON_SUCCESS: 'bg-success-50 dark:bg-success-500/20 text-success-600 dark:text-success-400',
  
  STAT_CARD_LABEL: 'text-sm text-surface-500 dark:text-surface-400 mb-1',
  STAT_CARD_VALUE: 'text-2xl font-semibold text-surface-900 dark:text-white',
  STAT_CARD_TREND: 'flex items-center gap-1 text-xs mt-2',
  STAT_CARD_TREND_UP: 'text-success-500',
  STAT_CARD_TREND_DOWN: 'text-error-500',
  
  // Charts section
  CHARTS_GRID: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6',
  CHART_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5',
  CHART_HEADER: 'flex items-center justify-between mb-4',
  CHART_TITLE: 'text-lg font-semibold text-surface-900 dark:text-white',
  CHART_SUBTITLE: 'text-sm text-surface-500 dark:text-surface-400',
  CHART_CONTAINER: 'h-64',
  
  // Activity feed
  ACTIVITY_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800',
  ACTIVITY_HEADER: 'px-5 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between',
  ACTIVITY_LIST: 'divide-y divide-surface-100 dark:divide-surface-800',
  ACTIVITY_ITEM: 'px-5 py-4 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors',
  ACTIVITY_ITEM_ICON: 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  ACTIVITY_ITEM_CONTENT: 'ml-4 flex-1 min-w-0',
  ACTIVITY_ITEM_TITLE: 'text-sm font-medium text-surface-900 dark:text-white truncate',
  ACTIVITY_ITEM_DESCRIPTION: 'text-xs text-surface-500 dark:text-surface-400 mt-0.5',
  ACTIVITY_ITEM_TIME: 'text-xs text-surface-400 dark:text-surface-500 ml-4',
  
  // Topics list
  TOPICS_LIST: 'space-y-3',
  TOPIC_ITEM: 'flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-850 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer',
  TOPIC_COLOR_DOT: 'w-3 h-3 rounded-full flex-shrink-0',
  TOPIC_NAME: 'flex-1 font-medium text-surface-900 dark:text-white truncate',
  TOPIC_COUNT: 'text-sm text-surface-500 dark:text-surface-400',
  TOPIC_BADGE: 'ml-2',
}

export const DASHBOARD_COLORS = {
  PRIMARY: '#3374ff',
  ACCENT: '#04c8ae',
  SECONDARY: '#a855f7',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
}
