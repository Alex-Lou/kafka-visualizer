// Node-specific styles
export const NODES = {
  // Base node styles
  NODE_BASE: 'px-4 py-3 rounded-2xl border-2 min-w-[150px] transition-all duration-200 relative',
  NODE_SELECTED: 'shadow-lg',
  NODE_HOVER: 'hover:shadow-lg',

  // Node status backgrounds
  NODE_BG_ACTIVE: 'bg-white dark:bg-surface-800',
  NODE_BG_SUCCESS: 'bg-success-50 dark:bg-success-900/40',
  NODE_BG_WARNING: 'bg-warning-50 dark:bg-warning-900/40',
  NODE_BG_DANGER: 'bg-danger-50 dark:bg-danger-900/40',
  NODE_BG_PRIMARY: 'bg-primary-50 dark:bg-primary-900/40',
  NODE_BG_SECONDARY: 'bg-secondary-50 dark:bg-secondary-900/40',
  NODE_BG_ACCENT: 'bg-accent-50 dark:bg-accent-900/40',
  NODE_BG_ACCENT_LIGHT: 'bg-accent-50/50 dark:bg-accent-900/20',
  NODE_BG_SURFACE: 'bg-surface-50 dark:bg-surface-800',

  // Node status borders
  NODE_BORDER_ACTIVE: 'border-surface-200 dark:border-surface-700',
  NODE_BORDER_SUCCESS: 'border-success-500',
  NODE_BORDER_WARNING: 'border-warning-500',
  NODE_BORDER_DANGER: 'border-danger-500',
  NODE_BORDER_PRIMARY: 'border-primary-500',
  NODE_BORDER_SECONDARY: 'border-secondary-300 dark:border-secondary-700',
  NODE_BORDER_ACCENT: 'border-accent-500',
  NODE_BORDER_ACCENT_ALT: 'border-accent-400 dark:border-accent-600',
  NODE_BORDER_SURFACE: 'border-surface-300 dark:border-surface-600',

  // Node status shadows
  NODE_SHADOW_SUCCESS: 'shadow-success-500/30',
  NODE_SHADOW_WARNING: 'shadow-warning-500/30',
  NODE_SHADOW_DANGER: 'shadow-danger-500/40',
  NODE_SHADOW_PRIMARY: 'shadow-primary-500/30',
  NODE_SHADOW_SECONDARY: 'shadow-secondary-500/30',
  NODE_SHADOW_ACCENT: 'shadow-accent-500/30',
  NODE_SHADOW_SURFACE: 'shadow-surface-500/20',

  // Node icon container
  NODE_ICON_BASE: 'w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative',
  NODE_ICON_BG_ACTIVE: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
  NODE_ICON_BG_SELECTED: 'bg-primary-500 text-white',
  NODE_ICON_BG_SUCCESS: 'bg-success-500 text-white',
  NODE_ICON_BG_WARNING: 'bg-warning-500 text-white',
  NODE_ICON_BG_DANGER: 'bg-danger-500 text-white',
  NODE_ICON_BG_SURFACE: 'bg-surface-400 text-white',
  NODE_ICON_BG_SECONDARY: 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-600 dark:text-secondary-400',
  NODE_ICON_BG_SECONDARY_SELECTED: 'bg-secondary-500 text-white',
  NODE_ICON_BG_ACCENT: 'bg-accent-200 dark:bg-accent-800 text-accent-600 dark:text-accent-400',
  NODE_ICON_BG_ACCENT_SELECTED: 'bg-accent-500 text-white',
  NODE_ICON_BG_ACCENT_INACTIVE: 'bg-surface-200 dark:bg-surface-700 text-surface-500',
  NODE_ICON_BG_WARNING_NODE: 'bg-warning-100 dark:bg-warning-900/50 text-warning-600 dark:text-warning-400',
  NODE_ICON_BG_WARNING_SELECTED: 'bg-warning-500 text-white',

  // Node content
  NODE_CONTENT: 'flex items-center gap-3',
  NODE_LABEL: 'text-sm font-semibold text-surface-900 dark:text-white truncate',
  NODE_SUBLABEL: 'text-xs text-surface-500 dark:text-surface-400',
  NODE_SUBLABEL_ALT: 'text-xs text-surface-600 dark:text-surface-300',
  NODE_TEXT_CONTAINER: 'flex-1 min-w-0',

  // Node metrics section
  NODE_METRICS: 'mt-2 pt-2 border-t',
  NODE_METRICS_BORDER_ACCENT: 'border-accent-200 dark:border-accent-800',
  NODE_METRICS_BORDER_SURFACE: 'border-surface-100 dark:border-surface-700',
  NODE_METRICS_BORDER_WARNING: 'border-warning-200 dark:border-warning-800',
  NODE_METRICS_BORDER_DANGER: 'border-danger-200 dark:border-danger-800',
  NODE_METRICS_ROW: 'flex items-center gap-1 text-xs',
  NODE_METRICS_TEXT_ACCENT: 'text-accent-600 dark:text-accent-400',
  NODE_METRICS_TEXT_PRIMARY: 'text-primary-600 dark:text-primary-400',
  NODE_METRICS_TEXT_WARNING: 'text-warning-600 dark:text-warning-400',
  NODE_METRICS_TEXT_DANGER: 'text-danger-600 dark:text-danger-400',
  NODE_METRICS_TEXT_SURFACE: 'text-surface-600 dark:text-surface-400',

  // Node status badge (top right corner)
  NODE_BADGE_CONTAINER: 'absolute -top-1 -right-1 flex items-center justify-center',
  NODE_BADGE_CONTAINER_ALT: 'absolute -top-2 -right-2',
  NODE_BADGE_DOT: 'w-3 h-3 rounded-full border-2 border-white dark:border-surface-800 animate-pulse',
  NODE_BADGE_DOT_SUCCESS: 'bg-success-500',
  NODE_BADGE_CIRCLE: 'w-6 h-6 rounded-full border-2 border-white dark:border-surface-800 flex items-center justify-center',
  NODE_BADGE_TEXT: 'text-white text-xs font-bold',

  // Node status label (bottom)
  NODE_STATUS_LABEL: 'absolute -bottom-2 left-1/2 transform -translate-x-1/2',
  NODE_STATUS_LABEL_INNER: 'px-2 py-0.5 rounded text-[10px] font-semibold text-white shadow-md',

  // Node bottom badge (rebalancing, read-only, etc.)
  NODE_BOTTOM_BADGE: 'absolute -bottom-1 left-1/2 transform -translate-x-1/2',
  NODE_BOTTOM_BADGE_PRIMARY: 'px-2 py-0.5 bg-primary-500 text-white rounded text-[10px] font-semibold flex items-center gap-1',
  NODE_BOTTOM_BADGE_SURFACE: 'px-2 py-0.5 bg-surface-500 text-white rounded text-[10px] font-semibold',

  // Connection handles
  HANDLE_BASE: '!w-3 !h-3 !border-2 !border-white dark:!border-surface-800',
};
