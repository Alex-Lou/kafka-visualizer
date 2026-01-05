// Sidebar specific styles
export const SIDEBAR = {
  // Container
  CONTAINER: 'fixed left-0 top-0 h-screen bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 z-40 flex flex-col transition-all duration-300',
  CONTAINER_EXPANDED: 'w-64',
  CONTAINER_COLLAPSED: 'w-16',
  
  // Header
  HEADER: 'h-16 flex items-center border-b border-surface-200 dark:border-surface-800 flex-shrink-0',
  HEADER_EXPANDED: 'px-4 justify-between',
  HEADER_COLLAPSED: 'justify-center',
  
  // Logo
  LOGO: 'flex items-center gap-3',
  LOGO_ICON: 'w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white',
  LOGO_TEXT: 'font-display font-semibold text-surface-900 dark:text-white',
  
  // Toggle button
  TOGGLE_BTN: 'p-1.5 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
  
  // Navigation
  NAV_CONTAINER: 'flex-1 overflow-y-auto py-4 scrollbar-hide',
  NAV_SECTION: 'mb-6',
  NAV_SECTION_TITLE: 'px-4 mb-2 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider',
  
  // Nav items
  NAV_LIST: 'space-y-1',
  NAV_LIST_COLLAPSED: 'px-2',
  NAV_LIST_EXPANDED: 'px-3',
  
  NAV_ITEM: 'flex items-center gap-3 rounded-xl transition-all duration-200',
  NAV_ITEM_EXPANDED: 'px-3 py-2.5',
  NAV_ITEM_COLLAPSED: 'p-2.5 justify-center',
  NAV_ITEM_DEFAULT: 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800',
  NAV_ITEM_ACTIVE: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-medium',
  
  NAV_ITEM_ICON: 'w-5 h-5 flex-shrink-0',
  NAV_ITEM_TEXT: 'text-sm',
  NAV_ITEM_BADGE: 'ml-auto',
  
  // Footer
  FOOTER: 'p-4 border-t border-surface-200 dark:border-surface-800 flex-shrink-0',
  FOOTER_COLLAPSED: 'p-2',
  
  // User section
  USER_SECTION: 'flex items-center gap-3',
  USER_AVATAR: 'w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-sm font-medium',
  USER_INFO: 'flex-1 min-w-0',
  USER_NAME: 'text-sm font-medium text-surface-900 dark:text-white truncate',
  USER_ROLE: 'text-xs text-surface-500 dark:text-surface-400 truncate',
  
  // Connection indicator
  CONNECTION_STATUS: 'flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-850',
  CONNECTION_STATUS_COLLAPSED: 'p-2 justify-center',
  CONNECTION_DOT: 'w-2 h-2 rounded-full',
  CONNECTION_DOT_CONNECTED: 'bg-success-500 animate-pulse',
  CONNECTION_DOT_DISCONNECTED: 'bg-surface-400',
  CONNECTION_TEXT: 'text-xs text-surface-600 dark:text-surface-400',
}

export const SIDEBAR_ICONS = {
  DASHBOARD: 'LayoutDashboard',
  CONNECTIONS: 'Server',
  TOPICS: 'MessageSquare',
  MESSAGES: 'FileText',
  FLOW: 'GitBranch',
  SETTINGS: 'Settings',
  HELP: 'HelpCircle',
  LOGOUT: 'LogOut',
  CHEVRON_LEFT: 'ChevronLeft',
  CHEVRON_RIGHT: 'ChevronRight',
}
