// Common component styles
export const BUTTONS = {
  // Base
  BASE: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Variants
  PRIMARY: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
  SECONDARY: 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700 focus:ring-surface-500',
  GHOST: 'bg-transparent text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:ring-surface-500',
  ACCENT: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus:ring-accent-500',
  DANGER: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-error-500',
  SUCCESS: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus:ring-success-500',
  
  // Sizes
  SIZE_XS: 'px-2.5 py-1.5 text-xs rounded-lg',
  SIZE_SM: 'px-3 py-2 text-sm rounded-lg',
  SIZE_MD: 'px-4 py-2.5 text-sm',
  SIZE_LG: 'px-5 py-3 text-base',
  SIZE_XL: 'px-6 py-3.5 text-lg',
  
  // Icon only
  ICON_ONLY: 'p-2.5 rounded-xl',
  ICON_ONLY_SM: 'p-2 rounded-lg',
  ICON_ONLY_LG: 'p-3 rounded-xl',
}

export const INPUTS = {
  // Base
  BASE: 'w-full px-4 py-2.5 rounded-xl bg-black border border-surface-200 dark:border-surface-700 text-white placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200',
  
  // States
  ERROR: 'border-error-500 focus:ring-error-500/50 focus:border-error-500',
  SUCCESS: 'border-success-500 focus:ring-success-500/50 focus:border-success-500',
  DISABLED: 'opacity-50 cursor-not-allowed bg-surface-100 dark:bg-surface-900',
  
  // Sizes
  SIZE_SM: 'px-3 py-2 text-sm rounded-lg',
  SIZE_MD: 'px-4 py-2.5 text-sm',
  SIZE_LG: 'px-5 py-3 text-base',
  
  // With icon
  WITH_ICON_LEFT: 'pl-10',
  WITH_ICON_RIGHT: 'pr-10',
  
  // Label
  LABEL: 'block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5',
  
  // Helper text
  HELPER: 'mt-1.5 text-xs text-surface-500',
  HELPER_ERROR: 'mt-1.5 text-xs text-error-500',
}

export const CARDS = {
  // Base
  BASE: 'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800',
  
  // Variants
  DEFAULT: 'shadow-sm hover:shadow-md transition-shadow duration-300',
  INTERACTIVE: 'cursor-pointer hover:border-primary-500/50 hover:shadow-glow transition-all duration-300',
  GLASS: 'bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-white/20 dark:border-white/10',
  FLAT: 'shadow-none',
  ELEVATED: 'shadow-lg',
  
  // Padding
  PADDING_SM: 'p-4',
  PADDING_MD: 'p-5',
  PADDING_LG: 'p-6',
  PADDING_XL: 'p-8',
  
  // Header
  HEADER: 'px-5 py-4 border-b border-surface-200 dark:border-surface-800',
  HEADER_WITH_ACTIONS: 'px-5 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between',
  
  // Body
  BODY: 'p-5',
  
  // Footer
  FOOTER: 'px-5 py-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850 rounded-b-2xl',
}

export const BADGES = {
  // Base
  BASE: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
  
  // Variants
  PRIMARY: 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300',
  SECONDARY: 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-700 dark:text-secondary-300',
  ACCENT: 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300',
  SUCCESS: 'bg-success-50 dark:bg-success-500/20 text-success-600 dark:text-success-400',
  WARNING: 'bg-warning-50 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400',
  ERROR: 'bg-error-50 dark:bg-error-500/20 text-error-600 dark:text-error-400',
  NEUTRAL: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
  
  // Sizes
  SIZE_SM: 'px-2 py-0.5 text-[10px]',
  SIZE_MD: 'px-2.5 py-1 text-xs',
  SIZE_LG: 'px-3 py-1.5 text-sm',
}

export const STATUS_DOTS = {
  BASE: 'w-2.5 h-2.5 rounded-full',
  CONNECTED: 'bg-success-500 animate-pulse',
  DISCONNECTED: 'bg-surface-400',
  ERROR: 'bg-error-500',
  CONNECTING: 'bg-warning-500 animate-pulse',
  PENDING: 'bg-primary-500 animate-pulse',
}

export const ICONS = {
  // Sizes
  SIZE_XS: 'w-3 h-3',
  SIZE_SM: 'w-4 h-4',
  SIZE_MD: 'w-5 h-5',
  SIZE_LG: 'w-6 h-6',
  SIZE_XL: 'w-8 h-8',
  SIZE_2XL: 'w-10 h-10',
  
  // Colors
  DEFAULT: 'text-surface-500',
  PRIMARY: 'text-primary-500',
  SECONDARY: 'text-secondary-500',
  ACCENT: 'text-accent-500',
  SUCCESS: 'text-success-500',
  WARNING: 'text-warning-500',
  ERROR: 'text-error-500',
}

export const AVATARS = {
  // Base
  BASE: 'rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300 font-medium',
  
  // Sizes
  SIZE_XS: 'w-6 h-6 text-xs',
  SIZE_SM: 'w-8 h-8 text-sm',
  SIZE_MD: 'w-10 h-10 text-sm',
  SIZE_LG: 'w-12 h-12 text-base',
  SIZE_XL: 'w-16 h-16 text-lg',
}
