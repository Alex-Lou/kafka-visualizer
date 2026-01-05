// Layout styles constants
export const LAYOUT = {
  // Main container
  MAIN_CONTAINER: 'min-h-screen bg-surface-50 dark:bg-surface-950',
  
  // App shell
  APP_SHELL: 'flex min-h-screen',
  
  // Sidebar
  SIDEBAR: 'fixed left-0 top-0 h-screen w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 z-40',
  SIDEBAR_COLLAPSED: 'w-16',
  SIDEBAR_HEADER: 'h-16 flex items-center px-4 border-b border-surface-200 dark:border-surface-800',
  SIDEBAR_CONTENT: 'flex-1 overflow-y-auto py-4 px-3',
  SIDEBAR_FOOTER: 'p-4 border-t border-surface-200 dark:border-surface-800',
  
  // Main content
  CONTENT_WRAPPER: 'flex-1 ml-64',
  CONTENT_WRAPPER_COLLAPSED: 'ml-16',
  
  // Header
  HEADER: 'sticky top-0 z-30 h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800',
  HEADER_INNER: 'h-full px-6 flex items-center justify-between',
  
  // Page content
  PAGE_CONTENT: 'p-6',
  PAGE_CONTENT_WIDE: 'px-8 py-6',
  
  // Grid layouts
  GRID_2_COLS: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  GRID_3_COLS: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  GRID_4_COLS: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  GRID_AUTO: 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6',
  
  // Flex layouts
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_START: 'flex items-center justify-start',
  FLEX_END: 'flex items-center justify-end',
  FLEX_COL: 'flex flex-col',
  FLEX_COL_CENTER: 'flex flex-col items-center justify-center',
  
  // Spacing
  SECTION: 'mb-8',
  SECTION_TIGHT: 'mb-4',
  SECTION_LOOSE: 'mb-12',
  
  // Max widths
  MAX_WIDTH_SM: 'max-w-sm mx-auto',
  MAX_WIDTH_MD: 'max-w-md mx-auto',
  MAX_WIDTH_LG: 'max-w-lg mx-auto',
  MAX_WIDTH_XL: 'max-w-xl mx-auto',
  MAX_WIDTH_2XL: 'max-w-2xl mx-auto',
  MAX_WIDTH_4XL: 'max-w-4xl mx-auto',
  MAX_WIDTH_6XL: 'max-w-6xl mx-auto',
  MAX_WIDTH_FULL: 'max-w-full',
}

export const TRANSITIONS = {
  DEFAULT: 'transition-all duration-200',
  FAST: 'transition-all duration-100',
  SLOW: 'transition-all duration-300',
  COLORS: 'transition-colors duration-200',
  TRANSFORM: 'transition-transform duration-200',
  OPACITY: 'transition-opacity duration-200',
  SHADOW: 'transition-shadow duration-200',
}

export const ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  SLIDE_UP: 'animate-slide-up',
  SLIDE_DOWN: 'animate-slide-down',
  PULSE: 'animate-pulse',
  PULSE_SLOW: 'animate-pulse-slow',
  SPIN: 'animate-spin',
  BOUNCE: 'animate-bounce',
  FLOAT: 'animate-float',
  FLOW: 'animate-flow',
}
