// TopicControlPanel Styles Constants
// Path: src/constants/styles/flow/topicControlPanel.js

// =============================================================================
// MODAL OVERLAY & CONTAINER
// =============================================================================

export const MODAL_OVERLAY = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm';

export const MODAL_CONTAINER = 'bg-card border border-border rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-auto';

// =============================================================================
// HEADER
// =============================================================================

export const HEADER_WRAPPER = 'flex items-center justify-between p-4 border-b border-border';

export const HEADER_CONTENT = 'flex items-center gap-3';

export const HEADER_ICON_WRAPPER_BASE = 'w-10 h-10 rounded-lg flex items-center justify-center relative';

export const HEADER_ICON = 'w-5 h-5';

export const HEADER_ACTIVITY_INDICATOR = 'absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse';

export const HEADER_TITLE = 'text-lg font-semibold text-foreground';

export const HEADER_SUBTITLE = 'text-sm text-muted-foreground';

export const HEADER_CLOSE_BUTTON = 'p-2 hover:bg-muted rounded-lg transition-colors';

export const HEADER_CLOSE_ICON = 'w-5 h-5';

// =============================================================================
// BODY
// =============================================================================

export const BODY_WRAPPER = 'p-4 space-y-4';

// =============================================================================
// STATUS SECTION
// =============================================================================

export const STATUS_SECTION = 'flex items-center justify-between';

export const STATUS_LABEL_WRAPPER = 'space-y-1';

export const STATUS_LABEL = 'text-sm font-medium text-foreground';

export const STATUS_INDICATOR_WRAPPER = 'flex items-center gap-2';

export const STATUS_DOT_BASE = 'w-3 h-3 rounded-full';

export const STATUS_DOT_PULSE = 'animate-pulse';

export const STATUS_TEXT = 'text-sm text-foreground capitalize';

// =============================================================================
// ERROR SECTION
// =============================================================================

export const ERROR_CONTAINER = 'rounded-lg border border-red-500/30 bg-red-500/5 overflow-hidden';

export const ERROR_HEADER = 'flex items-center gap-2 px-4 py-3 bg-red-500/10 border-b border-red-500/20';

export const ERROR_HEADER_ICON = 'w-4 h-4 text-red-400';

export const ERROR_HEADER_TEXT = 'text-sm font-medium text-red-400';

export const ERROR_BODY = 'p-4 space-y-3';

export const ERROR_MESSAGE_WRAPPER = 'space-y-1';

export const ERROR_MESSAGE_LABEL_WRAPPER = 'flex items-center gap-2 text-xs text-red-300/70';

export const ERROR_MESSAGE_LABEL_ICON = 'w-3 h-3';

export const ERROR_MESSAGE_TEXT = 'text-sm text-red-200 bg-red-500/10 rounded px-3 py-2 font-mono break-all';

export const ERROR_DETAILS_GRID = 'grid grid-cols-2 gap-3 text-sm';

export const ERROR_DETAIL_WRAPPER = 'space-y-1';

export const ERROR_DETAIL_LABEL_WRAPPER = 'flex items-center gap-1.5 text-xs text-red-300/70';

export const ERROR_DETAIL_LABEL_ICON = 'w-3 h-3';

export const ERROR_DETAIL_VALUE = 'text-red-200 font-mono';

export const ERROR_DETAIL_VALUE_NORMAL = 'text-red-200';

export const ERROR_RETRY_BUTTON = 'w-full mt-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-300';

// =============================================================================
// METRICS SECTION
// =============================================================================

export const METRICS_GRID = 'grid grid-cols-2 gap-3 p-3 rounded-lg';

export const METRICS_GRID_NORMAL = 'grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted';

export const METRICS_GRID_ERROR = 'grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 opacity-60';

export const METRICS_EXTENDED_GRID = 'grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50';

export const METRIC_ITEM = '';

export const METRIC_LABEL = 'text-xs text-muted-foreground';

export const METRIC_LABEL_WRAPPER = 'flex items-center gap-1.5';

export const METRIC_VALUE = 'text-lg font-semibold text-foreground';

export const METRIC_VALUE_ACTIVE = 'text-lg font-semibold text-green-500';

export const METRIC_VALUE_SMALL = 'text-sm font-medium text-foreground';

export const METRIC_ACTIVITY_ICON = 'w-3 h-3 text-green-500 animate-pulse';

// =============================================================================
// REALTIME INDICATOR
// =============================================================================

export const REALTIME_WRAPPER = 'flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20';

export const REALTIME_CONTENT = 'flex items-center gap-2';

export const REALTIME_DOT_ACTIVE = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';

export const REALTIME_DOT_CONNECTED = 'w-2 h-2 rounded-full bg-blue-500';

export const REALTIME_DOT_INACTIVE = 'w-2 h-2 rounded-full bg-gray-500';

export const REALTIME_TEXT = 'text-xs text-blue-400';

export const REALTIME_TIMESTAMP = 'text-xs text-muted-foreground';

// =============================================================================
// EDIT SECTION
// =============================================================================

export const EDIT_FORM_WRAPPER = 'space-y-3';

export const EDIT_FIELD_WRAPPER = '';

export const EDIT_FIELD_LABEL = 'text-sm font-medium text-foreground';

export const EDIT_INPUT = 'w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

export const EDIT_BUTTONS_WRAPPER = 'flex gap-2';

// =============================================================================
// DETAILS SECTION
// =============================================================================

export const DETAILS_WRAPPER = 'space-y-2';

export const DETAILS_LABEL = 'text-sm font-medium text-foreground';

export const DETAILS_LIST = 'space-y-1 text-sm';

export const DETAILS_ROW = 'flex justify-between';

export const DETAILS_ROW_LABEL = 'text-muted-foreground';

export const DETAILS_ROW_VALUE = 'text-foreground font-mono';

export const DETAILS_ROW_VALUE_NORMAL = 'text-foreground';

// =============================================================================
// ACTION BUTTONS
// =============================================================================

export const ACTIONS_GRID = 'grid grid-cols-2 gap-2 pt-4 border-t border-border';

export const DELETE_SECTION = 'pt-4 border-t border-border';

export const DELETE_BUTTON = 'w-full';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Retourne la classe du grid metrics selon l'état d'erreur
 */
export const getMetricsGridClass = (isError) => {
  return isError ? METRICS_GRID_ERROR : METRICS_GRID_NORMAL;
};

/**
 * Retourne la classe de la valeur metric selon l'activité
 */
export const getMetricValueClass = (hasActivity) => {
  return hasActivity ? METRIC_VALUE_ACTIVE : METRIC_VALUE;
};

/**
 * Retourne la classe du dot status
 */
export const getStatusDotClass = (isError, hasActivity) => {
  const baseClass = STATUS_DOT_BASE;
  const pulseClass = (isError || hasActivity) ? ` ${STATUS_DOT_PULSE}` : '';
  return baseClass + pulseClass;
};

/**
 * Retourne la classe du dot realtime selon l'état
 */
export const getRealtimeDotClass = (hasActivity, consumerActive) => {
  if (hasActivity) return REALTIME_DOT_ACTIVE;
  if (consumerActive) return REALTIME_DOT_CONNECTED;
  return REALTIME_DOT_INACTIVE;
};

/**
 * Génère le style inline pour le wrapper d'icône header
 */
export const getHeaderIconWrapperStyle = (statusColor) => ({
  backgroundColor: statusColor + '20',
  color: statusColor,
});

/**
 * Génère le style inline pour le dot de status
 */
export const getStatusDotStyle = (hasActivity, statusColor) => ({
  backgroundColor: hasActivity ? '#22c55e' : statusColor,
});