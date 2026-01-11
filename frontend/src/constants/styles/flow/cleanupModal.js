// CleanupModal Styles Constants
// Path: src/constants/styles/flow/cleanupModal.js

// =============================================================================
// MODAL OVERLAY & CONTAINER
// =============================================================================

export const MODAL_OVERLAY = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';

export const MODAL_CONTAINER = 'bg-white dark:bg-surface-900 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col';

// =============================================================================
// HEADER
// =============================================================================

export const HEADER_WRAPPER = 'px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex-shrink-0';

export const HEADER_CONTENT = 'flex items-center gap-3';

export const HEADER_ICON_WRAPPER = 'w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-900/50 flex items-center justify-center';

export const HEADER_ICON = 'w-5 h-5 text-warning-600';

export const HEADER_TITLE = 'text-lg font-semibold text-surface-900 dark:text-white';

export const HEADER_SUBTITLE = 'text-sm text-surface-500';

// =============================================================================
// BODY
// =============================================================================

export const BODY_WRAPPER = 'p-6 space-y-6 overflow-y-auto flex-1';

// =============================================================================
// LOADING STATE
// =============================================================================

export const LOADING_WRAPPER = 'flex items-center justify-center py-12';

export const LOADING_SPINNER = 'w-6 h-6 animate-spin text-primary-500';

export const LOADING_TEXT = 'ml-3 text-surface-600 dark:text-surface-400';

// =============================================================================
// EMPTY STATE
// =============================================================================

export const EMPTY_WRAPPER = 'flex flex-col items-center justify-center py-12 text-center';

export const EMPTY_ICON_WRAPPER = 'w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mb-4';

export const EMPTY_ICON = 'w-8 h-8 text-success-600';

export const EMPTY_TITLE = 'text-lg font-medium text-surface-900 dark:text-white';

export const EMPTY_SUBTITLE = 'text-sm text-surface-500 mt-1';

// =============================================================================
// SECTION
// =============================================================================

export const SECTION_WRAPPER = 'space-y-3';

export const SECTION_HEADER = 'flex items-center justify-between';

export const SECTION_TITLE_WRAPPER = 'flex items-center gap-2';

export const SECTION_ICON = 'w-4 h-4';

export const SECTION_ICON_CONNECTION = 'w-4 h-4 text-primary-500';

export const SECTION_ICON_TOPIC = 'w-4 h-4 text-accent-500';

export const SECTION_TITLE = 'text-sm font-semibold text-surface-900 dark:text-white';

export const SECTION_COUNT = 'text-xs text-surface-500';

// =============================================================================
// SELECT ALL CONTROLS
// =============================================================================

export const SELECT_ALL_WRAPPER = 'flex items-center gap-2';

export const SELECT_ALL_BUTTON = 'text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer font-medium';

export const SELECT_ALL_SEPARATOR = 'text-surface-300 dark:text-surface-600';

// =============================================================================
// LIST
// =============================================================================

export const LIST_WRAPPER = 'space-y-2 max-h-48 overflow-y-auto';

export const LIST_ITEM = 'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer';

export const LIST_ITEM_SELECTED = 'flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 transition-colors cursor-pointer';

export const LIST_ITEM_UNSELECTED = 'flex items-center gap-3 p-3 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer';

// =============================================================================
// CHECKBOX
// =============================================================================

export const CHECKBOX_WRAPPER = 'flex-shrink-0';

export const CHECKBOX_INPUT = 'w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 dark:bg-surface-700 cursor-pointer';

// =============================================================================
// ITEM INFO
// =============================================================================

export const ITEM_INFO_WRAPPER = 'flex-1 min-w-0';

export const ITEM_NAME = 'text-sm font-medium text-surface-900 dark:text-white truncate';

export const ITEM_META = 'flex items-center gap-2 mt-0.5 flex-wrap';

export const ITEM_META_TEXT = 'text-xs text-surface-500';

export const ITEM_META_SEPARATOR = 'text-surface-300 dark:text-surface-600';

// =============================================================================
// STATUS BADGE
// =============================================================================

export const STATUS_BADGE_BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium';

export const STATUS_BADGE_ERROR = 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400';

export const STATUS_BADGE_DISCONNECTED = 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400';

export const STATUS_BADGE_CONNECTING = 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400';

export const STATUS_BADGE_DELETED = 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400';

// =============================================================================
// WARNING BOX
// =============================================================================

export const WARNING_BOX = 'flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/30 rounded-xl';

export const WARNING_ICON = 'w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0';

export const WARNING_TEXT = 'text-sm text-warning-700 dark:text-warning-300';

// =============================================================================
// SUMMARY BOX
// =============================================================================

export const SUMMARY_BOX = 'flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl';

export const SUMMARY_LABEL = 'text-sm text-surface-600 dark:text-surface-400';

export const SUMMARY_VALUE = 'text-sm font-semibold text-surface-900 dark:text-white';

// =============================================================================
// FOOTER
// =============================================================================

export const FOOTER_WRAPPER = 'px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex gap-3 justify-end flex-shrink-0';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Retourne la classe de l'item selon la sélection
 */
export const getListItemClass = (isSelected) => {
  return isSelected ? LIST_ITEM_SELECTED : LIST_ITEM_UNSELECTED;
};

/**
 * Retourne la classe du badge selon le status
 */
export const getStatusBadgeClass = (status) => {
  const base = STATUS_BADGE_BASE;
  switch (status) {
    case 'ERROR':
      return `${base} ${STATUS_BADGE_ERROR}`;
    case 'DISCONNECTED':
      return `${base} ${STATUS_BADGE_DISCONNECTED}`;
    case 'CONNECTING':
      return `${base} ${STATUS_BADGE_CONNECTING}`;
    case 'DELETED':
      return `${base} ${STATUS_BADGE_DELETED}`;
    default:
      return `${base} ${STATUS_BADGE_DISCONNECTED}`;
  }
};