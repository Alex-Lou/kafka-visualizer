// AutoGenerateModal Styles Constants
// Path: src/constants/styles/autoGenerate.js

// =============================================================================
// MODAL CONTAINER
// =============================================================================

export const MODAL_OVERLAY = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';

export const MODAL_CONTAINER = 'bg-white dark:bg-surface-900 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden';

// =============================================================================
// HEADER
// =============================================================================

export const HEADER_WRAPPER = 'px-6 py-4 border-b border-surface-200 dark:border-surface-800';

export const HEADER_CONTENT = 'flex items-center gap-3';

export const HEADER_ICON_WRAPPER = 'w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center';

export const HEADER_ICON = 'w-5 h-5 text-primary-600';

export const HEADER_TITLE = 'text-lg font-semibold text-surface-900 dark:text-white';

export const HEADER_SUBTITLE = 'text-sm text-surface-500';

// =============================================================================
// BODY
// =============================================================================

export const BODY_WRAPPER = 'p-6 space-y-4';

export const BODY_DESCRIPTION = 'text-surface-600 dark:text-surface-400';

export const SECTION_WRAPPER = 'space-y-2';

// =============================================================================
// CONNECTIONS SUMMARY CARD
// =============================================================================

export const SUMMARY_CARD = 'p-3 bg-surface-50 dark:bg-surface-800 rounded-xl space-y-2';

export const SUMMARY_CARD_HEADER = 'flex items-center justify-between';

export const SUMMARY_CARD_LABEL_WRAPPER = 'flex items-center gap-2';

export const SUMMARY_CARD_ICON_PRIMARY = 'w-4 h-4 text-primary-500';

export const SUMMARY_CARD_ICON_ACCENT = 'w-4 h-4 text-accent-500';

export const SUMMARY_CARD_LABEL = 'text-sm font-medium text-surface-700 dark:text-surface-300';

// =============================================================================
// STATUS BREAKDOWN
// =============================================================================

export const STATUS_BREAKDOWN_WRAPPER = 'flex flex-wrap gap-2 pt-2 border-t border-surface-200 dark:border-surface-700';

export const STATUS_ICON_SMALL = 'w-3 h-3 mr-1';

// =============================================================================
// CONNECTIONS LIST
// =============================================================================

export const CONNECTIONS_LIST_WRAPPER = 'max-h-48 overflow-y-auto space-y-1';

export const CONNECTION_ITEM = 'flex items-center gap-3 p-2 bg-surface-100 dark:bg-surface-700/50 rounded-lg transition-colors';

export const CONNECTION_ITEM_SELECTED = 'flex items-center gap-3 p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-700 transition-colors';

export const CONNECTION_ITEM_UNSELECTED = 'flex items-center gap-3 p-2 bg-surface-100 dark:bg-surface-700/50 rounded-lg opacity-60 transition-colors';

// =============================================================================
// CHECKBOX
// =============================================================================

export const CHECKBOX_WRAPPER = 'flex-shrink-0';

export const CHECKBOX_INPUT = 'w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 dark:bg-surface-700 cursor-pointer';

// =============================================================================
// CONNECTION INFO
// =============================================================================

export const CONNECTION_INFO_WRAPPER = 'flex items-center gap-2 min-w-0 flex-1';

export const CONNECTION_NAME = 'text-sm text-surface-700 dark:text-surface-300 truncate';

export const CONNECTION_META_WRAPPER = 'flex items-center gap-2 flex-shrink-0';

export const CONNECTION_TOPICS_COUNT = 'text-xs text-surface-500';

// =============================================================================
// STATUS ICONS
// =============================================================================

export const STATUS_ICON_BASE = 'w-4 h-4 flex-shrink-0';

export const STATUS_ICON_SUCCESS = 'w-4 h-4 flex-shrink-0 text-green-500';

export const STATUS_ICON_DANGER = 'w-4 h-4 flex-shrink-0 text-red-500';

export const STATUS_ICON_WARNING = 'w-4 h-4 flex-shrink-0 text-yellow-500 animate-spin';

export const STATUS_ICON_DEFAULT = 'w-4 h-4 flex-shrink-0 text-gray-400';

// =============================================================================
// SELECT ALL CONTROLS
// =============================================================================

export const SELECT_ALL_WRAPPER = 'flex items-center justify-between py-2 px-1';

export const SELECT_ALL_LABEL = 'text-xs text-surface-500 dark:text-surface-400';

export const SELECT_ALL_BUTTONS = 'flex gap-2';

export const SELECT_ALL_BUTTON = 'text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer font-medium';

// =============================================================================
// TOPICS CARD
// =============================================================================

export const TOPICS_CARD = 'flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl';

export const TOPICS_LABEL_WRAPPER = 'flex items-center gap-2';

export const TOPICS_LABEL = 'text-sm text-surface-700 dark:text-surface-300';

// =============================================================================
// ALERTS / WARNINGS
// =============================================================================

export const ALERT_BASE = 'flex items-start gap-2 p-3 rounded-xl';

export const ALERT_DANGER = 'flex items-start gap-2 p-3 bg-danger-50 dark:bg-danger-900/30 rounded-xl';

export const ALERT_WARNING = 'flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/30 rounded-xl';

export const ALERT_INFO = 'flex items-start gap-2 p-3 bg-info-50 dark:bg-info-900/30 rounded-xl';

export const ALERT_ICON_DANGER = 'w-4 h-4 text-danger-500 mt-0.5';

export const ALERT_ICON_WARNING = 'w-4 h-4 text-warning-500 mt-0.5';

export const ALERT_ICON_INFO = 'w-4 h-4 text-info-500 mt-0.5';

export const ALERT_TEXT_DANGER = 'text-sm text-danger-700 dark:text-danger-300';

export const ALERT_TEXT_WARNING = 'text-sm text-warning-700 dark:text-warning-300';

export const ALERT_TEXT_INFO = 'text-sm text-info-700 dark:text-info-300';

// =============================================================================
// FOOTER
// =============================================================================

export const FOOTER_WRAPPER = 'px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex gap-3 justify-end';

// =============================================================================
// HELPER FUNCTION - Get status icon class
// =============================================================================

export const getStatusIconClass = (variant) => {
  switch (variant) {
    case 'success':
      return STATUS_ICON_SUCCESS;
    case 'danger':
      return STATUS_ICON_DANGER;
    case 'warning':
      return STATUS_ICON_WARNING;
    default:
      return STATUS_ICON_DEFAULT;
  }
};

// =============================================================================
// HELPER FUNCTION - Get connection item class
// =============================================================================

export const getConnectionItemClass = (isSelected) => {
  return isSelected ? CONNECTION_ITEM_SELECTED : CONNECTION_ITEM_UNSELECTED;
};