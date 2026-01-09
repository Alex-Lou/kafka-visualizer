// Analytics page specific styles
export const ANALYTICS = {
  PAGE_CONTAINER: 'space-y-6',

  // Header Actions
  TIME_RANGE_BUTTON_GROUP: 'flex gap-2',
  TIME_RANGE_BUTTON: 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
  TIME_RANGE_BUTTON_ACTIVE: 'bg-primary text-primary-foreground',
  TIME_RANGE_BUTTON_INACTIVE: 'bg-muted text-muted-foreground hover:bg-muted/80',

  // Stat Cards
  STATS_GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  STAT_CARD: 'p-4 flex flex-col',
  STAT_CARD_HEADER: 'flex items-center justify-between mb-3',
  STAT_CARD_TITLE: 'text-sm font-medium text-muted-foreground',
  STAT_CARD_ICON_WRAPPER: 'p-2 rounded-lg',
  STAT_CARD_ICON: 'w-4 h-4',
  STAT_CARD_BODY: 'flex items-baseline justify-between',
  STAT_CARD_VALUE: 'text-2xl font-bold text-foreground',

  // Color variants for stat cards
  STAT_COLOR_BLUE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  STAT_COLOR_RED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  STAT_COLOR_GREEN: 'bg-green-500/10 text-green-600 dark:text-green-400',
  STAT_COLOR_PURPLE: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',

  // Chart Cards
  CHART_GRID: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  CHART_CARD: 'p-6',
  CHART_HEADER: 'flex items-center justify-between mb-4',
  CHART_TITLE: 'font-semibold text-foreground flex items-center gap-2',
  CHART_ICON: 'w-5 h-5',
  CHART_SUBTITLE: 'text-xs text-muted-foreground',

  // Chart-specific icons
  ICON_PRIMARY: 'text-primary',
  ICON_RED: 'text-red-500',
  ICON_BLUE: 'text-blue-500',
  ICON_YELLOW: 'text-yellow-500',

  // SVG Chart Styles
  SVG_CHART_CONTAINER: 'w-full h-40 border border-border rounded-lg bg-muted/30 p-4',
  SVG_GRID_LINE: 'stroke-current stroke-opacity-10 stroke-1',
  THROUGHPUT_BAR: 'fill-primary fill-opacity-70',
  ERROR_TREND_LINE: 'fill-none stroke-red-600 dark:stroke-red-500 stroke-2',
  ERROR_TREND_AREA: 'fill-red-600/10 dark:fill-red-500/10',
  ERROR_TREND_DOT: 'fill-red-600 dark:fill-red-500',
  CHART_AXIS_LABEL: 'text-xs fill-current opacity-60',

  // Storage Breakdown & Performance
  PERFORMANCE_GRID: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  PROGRESS_BAR_CONTAINER: 'w-full h-2 bg-muted rounded-full overflow-hidden',
  PROGRESS_BAR_HOT: 'h-full bg-blue-500 rounded-full',
  PROGRESS_BAR_ARCHIVE: 'h-full bg-purple-500 rounded-full',
  PROGRESS_BAR_CPU: 'h-full bg-yellow-500 rounded-full',
  PROGRESS_BAR_MEMORY: 'h-full bg-orange-500 rounded-full',
  PROGRESS_BAR_DISK: 'h-full bg-green-500 rounded-full',

  STORAGE_ITEM: 'space-y-2',
  STORAGE_LABEL_ROW: 'flex justify-between items-center',
  STORAGE_LABEL: 'text-sm font-medium text-foreground',
  STORAGE_VALUE_HOT: 'text-sm font-semibold text-blue-600 dark:text-blue-400',
  STORAGE_VALUE_ARCHIVE: 'text-sm font-semibold text-purple-600 dark:text-purple-400',
  STORAGE_TOTAL_ROW: 'pt-2 border-t border-border',
  STORAGE_TOTAL_VALUE: 'text-sm font-bold text-foreground',

  PERFORMANCE_ITEM: 'space-y-4',
  PERFORMANCE_LABEL_ROW: 'flex justify-between items-center mb-1',
  PERFORMANCE_LABEL: 'text-sm text-muted-foreground',
  PERFORMANCE_VALUE: 'text-sm font-semibold text-foreground',
  PERFORMANCE_FOOTER: 'pt-3 border-t border-border mt-4',
  PERFORMANCE_FOOTER_ROW: 'flex justify-between items-center text-sm',

  // Top Topics Table
  TOPICS_CARD: 'p-6',
  TOPICS_HEADER: 'flex items-center justify-between mb-4',
  TOPICS_TITLE: 'font-semibold text-foreground',
  TOPICS_SELECT: 'px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary',
  TOPICS_TABLE_WRAPPER: 'overflow-x-auto',
  TOPICS_TABLE: 'w-full text-sm',
  TOPICS_THEAD: 'border-b border-border',
  TOPICS_TH: 'text-left py-3 px-4 font-semibold text-muted-foreground',
  TOPICS_TH_RIGHT: 'text-right py-3 px-4 font-semibold text-muted-foreground',
  TOPICS_TBODY: 'divide-y divide-border',
  TOPICS_TR: 'hover:bg-muted/30 transition-colors',
  TOPICS_TD: 'py-3 px-4',
  TOPICS_TD_NAME: 'font-medium text-foreground',
  TOPICS_TD_RIGHT: 'text-right',
  TOPICS_TD_TREND: 'flex items-center justify-end gap-1',
  TREND_UP_ICON: 'w-4 h-4 text-green-500',
  TREND_DOWN_ICON: 'w-4 h-4 text-red-500',
  TREND_UP_TEXT: 'text-green-600 dark:text-green-400 text-xs font-medium',
  TREND_DOWN_TEXT: 'text-red-600 dark:text-red-400 text-xs font-medium',

  // Info Box
  INFO_BOX: 'p-4 border border-blue-500/30 bg-blue-500/5',
  INFO_BOX_CONTENT: 'flex gap-3',
  INFO_BOX_ICON: 'w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5',
  INFO_BOX_TITLE: 'text-sm font-medium text-blue-900 dark:text-blue-300',
  INFO_BOX_TEXT: 'text-xs text-blue-800 dark:text-blue-400 mt-1',
};
