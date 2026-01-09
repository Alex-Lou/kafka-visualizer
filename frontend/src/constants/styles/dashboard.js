// Dashboard specific styles
export const DASHBOARD = {
  // Live indicator
  REFRESH_INDICATOR: 'flex items-center gap-2 text-xs text-success-500',
  REFRESH_DOT: 'w-2 h-2 rounded-full bg-success-500 animate-pulse',

  // System Health Overview Card
  SYSTEM_CARD: 'bg-card border border-border rounded-lg p-5 mb-6',
  SYSTEM_HEADER: 'flex items-center justify-between mb-4',
  SYSTEM_TITLE: 'text-lg font-semibold text-foreground',
  SYSTEM_GRID: 'grid grid-cols-3 sm:grid-cols-6 gap-4 my-4',
  SYSTEM_METRIC: 'text-center',
  SYSTEM_METRIC_VALUE: 'text-xl font-bold text-foreground',
  SYSTEM_METRIC_LABEL: 'text-xs text-muted-foreground mt-1',

  // Health Components Section
  HEALTH_SECTION: 'mb-6',
  HEALTH_GRID: 'grid grid-cols-1 lg:grid-cols-3 gap-4',
  HEALTH_CARD: 'bg-card border border-border rounded-lg p-4',
  HEALTH_CARD_HEADER: 'flex items-center justify-between mb-3',
  HEALTH_CARD_TITLE: 'text-sm font-medium text-muted-foreground',
  HEALTH_CARD_BODY: 'space-y-2 text-sm',
  HEALTH_STATUS_ROW: 'flex justify-between',
  HEALTH_STATUS_LABEL: 'text-muted-foreground',
  HEALTH_STATUS_VALUE: 'font-medium text-foreground',

  // Health Status Badge
  HEALTH_STATUS_BADGE: 'px-2 py-0.5 rounded-full text-xs font-semibold',
  HEALTH_STATUS_UP: 'bg-success-500/10 text-success-500',
  HEALTH_STATUS_DOWN: 'bg-red-500/10 text-red-500',
  HEALTH_STATUS_DEGRADED: 'bg-yellow-500/10 text-yellow-500',

  // Memory Bar
  MEMORY_BAR_CONTAINER: 'mt-4',
  MEMORY_BAR_LABEL: 'flex justify-between text-xs text-muted-foreground mb-1',
  MEMORY_BAR_BG: 'w-full h-2 bg-muted rounded-full overflow-hidden',
  MEMORY_BAR_FILL: 'h-full rounded-full transition-all duration-300',
  MEMORY_BAR_OK: 'bg-green-500',
  MEMORY_BAR_WARNING: 'bg-yellow-500',
  MEMORY_BAR_DANGER: 'bg-red-500',

  // Stat Cards
  STATS_GRID: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
  STAT_CARD: 'bg-card border border-border rounded-lg p-5',
  STAT_CARD_ICON_WRAPPER: 'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
  STAT_CARD_LABEL: 'text-sm text-muted-foreground mb-1',
  STAT_CARD_VALUE: 'text-2xl font-bold text-foreground',

  // Icon background colors
  STAT_CARD_ICON_PRIMARY: 'bg-blue-500/10 text-blue-500',
  STAT_CARD_ICON_ACCENT: 'bg-teal-500/10 text-teal-500',
  STAT_CARD_ICON_SECONDARY: 'bg-purple-500/10 text-purple-500',
  STAT_CARD_ICON_SUCCESS: 'bg-green-500/10 text-green-500',

  // Active Connections List
  ACTIVITY_HEADER: 'px-5 py-4 border-b border-border flex items-center justify-between',
  CHART_TITLE: 'font-semibold text-foreground', // Re-using from charts
  ACTIVITY_LIST: 'divide-y divide-border',
  ACTIVITY_ITEM: 'p-4 hover:bg-muted/50 transition-colors',
  ACTIVITY_ITEM_ICON: 'w-10 h-10 rounded-lg flex items-center justify-center',
  ACTIVITY_ITEM_CONTENT: 'flex-1 min-w-0',
  ACTIVITY_ITEM_TITLE: 'font-medium text-foreground',
  ACTIVITY_ITEM_DESCRIPTION: 'text-sm text-muted-foreground truncate',
};
