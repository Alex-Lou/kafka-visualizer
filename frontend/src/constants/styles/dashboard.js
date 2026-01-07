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

  // Health section
  HEALTH_SECTION: 'mb-6',
  HEALTH_GRID: 'grid grid-cols-1 lg:grid-cols-3 gap-4',
  
  HEALTH_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5',
  HEALTH_CARD_HEADER: 'flex items-center justify-between mb-4',
  HEALTH_CARD_TITLE: 'text-sm font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider',
  HEALTH_CARD_BODY: 'space-y-3',
  
  HEALTH_STATUS_ROW: 'flex items-center justify-between',
  HEALTH_STATUS_LABEL: 'text-sm text-surface-600 dark:text-surface-400',
  HEALTH_STATUS_VALUE: 'text-sm font-medium text-surface-900 dark:text-white',
  
  HEALTH_STATUS_BADGE: 'px-2.5 py-1 rounded-full text-xs font-semibold',
  HEALTH_STATUS_UP: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
  HEALTH_STATUS_DOWN: 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400',
  HEALTH_STATUS_DEGRADED: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
  
  HEALTH_METRIC_CARD: 'bg-surface-50 dark:bg-surface-800 rounded-xl p-4',
  HEALTH_METRIC_LABEL: 'text-xs text-surface-500 dark:text-surface-400 mb-1',
  HEALTH_METRIC_VALUE: 'text-xl font-semibold text-surface-900 dark:text-white',
  HEALTH_METRIC_UNIT: 'text-sm font-normal text-surface-500 dark:text-surface-400 ml-1',
  
  // System overview card
  SYSTEM_CARD: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 mb-6',
  SYSTEM_HEADER: 'flex items-center justify-between mb-4',
  SYSTEM_TITLE: 'text-lg font-semibold text-surface-900 dark:text-white',
  SYSTEM_GRID: 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4',
  
  SYSTEM_METRIC: 'text-center',
  SYSTEM_METRIC_VALUE: 'text-2xl font-bold text-surface-900 dark:text-white',
  SYSTEM_METRIC_LABEL: 'text-xs text-surface-500 dark:text-surface-400 mt-1',
  
  // Memory bar
  MEMORY_BAR_CONTAINER: 'mt-2',
  MEMORY_BAR_LABEL: 'flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-1',
  MEMORY_BAR_BG: 'h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden',
  MEMORY_BAR_FILL: 'h-full rounded-full transition-all duration-500',
  MEMORY_BAR_OK: 'bg-success-500',
  MEMORY_BAR_WARNING: 'bg-warning-500',
  MEMORY_BAR_DANGER: 'bg-error-500',

  // Auto refresh indicator
  REFRESH_INDICATOR: 'flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400',
  REFRESH_DOT: 'w-2 h-2 rounded-full bg-success-500 animate-pulse',
}

export const DASHBOARD_COLORS = {
  PRIMARY: '#3374ff',
  ACCENT: '#04c8ae',
  SECONDARY: '#a855f7',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
}