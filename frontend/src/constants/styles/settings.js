// Settings page specific styles
export const SETTINGS = {
  PAGE_CONTAINER: 'max-w-4xl space-y-6 mx-auto',
  LOADING_WRAPPER: 'flex items-center justify-center h-full',
  LOADING_SPINNER: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary',

  // Card Styles
  CARD: 'p-0 overflow-hidden',
  CARD_HEADER: 'px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30',
  CARD_HEADER_ICON_WRAPPER: 'w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm',
  CARD_HEADER_ICON: 'w-5 h-5',
  CARD_HEADER_TITLE: 'font-semibold text-foreground text-lg',
  CARD_HEADER_SUBTITLE: 'text-sm text-muted-foreground',
  CARD_BODY: 'p-6 space-y-8',
  CARD_FOOTER: 'px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center',
  POLICY_CARD_DECORATION: 'border-primary/20 shadow-lg shadow-primary/5',
  FOOTER_META: 'text-xs text-muted-foreground',
  FOOTER_ACTIONS: 'flex gap-3',
  SAVE_BUTTON_ERROR: 'bg-red-500 hover:bg-red-600',
  SAVING_ICON: 'animate-spin mr-2',


  // Section Styles
  SECTION_GRID: 'grid grid-cols-1 md:grid-cols-2 gap-8',
  SECTION: 'space-y-4',
  SECTION_HEADER: 'flex items-center gap-2 font-medium border-b border-border pb-2',
  SECTION_TITLE_BLUE: 'text-blue-500',
  SECTION_TITLE_PURPLE: 'text-purple-500',
  SECTION_ICON: 'w-4 h-4',
  SECTION_DISABLED: 'opacity-50 pointer-events-none',

  // Form elements
  LABEL: 'text-sm font-medium text-foreground mb-1 block',
  DESCRIPTION: 'text-xs text-muted-foreground mt-1',
  SLIDER_CONTAINER: 'flex items-center gap-2',
  SLIDER: 'flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer',
  SLIDER_BLUE: 'accent-blue-500',
  SLIDER_VALUE: 'w-16 text-right font-mono text-sm',

  // Toggle Switch
  TOGGLE_WRAPPER: 'relative inline-flex items-center cursor-pointer',
  TOGGLE_INPUT: 'sr-only peer',
  TOGGLE_BG: 'w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all',
  TOGGLE_BG_LARGE: 'w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary',
  TOGGLE_PURPLE: 'peer-checked:bg-purple-500',
  TOGGLE_RED: 'peer-checked:bg-red-500',

  // Retention Timeline
  TIMELINE_CONTAINER: 'mt-4 mb-6',
  TIMELINE_LABELS: 'flex justify-between text-xs text-muted-foreground mb-2',
  TIMELINE_BAR: 'h-4 w-full bg-muted rounded-full overflow-hidden flex relative',
  TIMELINE_ZONE_HOT: 'h-full bg-blue-500 transition-all duration-500 relative group',
  TIMELINE_ZONE_ARCHIVE: 'h-full bg-purple-500 transition-all duration-500 relative group',
  TIMELINE_ZONE_HOVER: 'absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity',
  TIMELINE_ZONE_PURGE: 'flex-1 bg-red-500/20 h-full flex items-center justify-center',
  TIMELINE_PURGE_ICON: 'w-3 h-3 text-red-500 opacity-50',
  TIMELINE_LEGEND: 'flex justify-between mt-2 text-xs',
  TIMELINE_LEGEND_ITEM: 'flex items-center gap-1.5',
  TIMELINE_LEGEND_DOT: 'w-2 h-2 rounded-full',
  TIMELINE_LEGEND_DOT_HOT: 'bg-blue-500',
  TIMELINE_LEGEND_DOT_ARCHIVE: 'bg-purple-500',
  TIMELINE_LEGEND_DOT_PURGE: 'bg-red-500/50',
  TIMELINE_LEGEND_LABEL: 'font-medium text-foreground',
  TIMELINE_LEGEND_SUB_LABEL: 'text-muted-foreground',

  // Purge Section
  PURGE_SECTION_WRAPPER: 'pt-4 border-t border-border',
  PURGE_SECTION: 'flex items-center justify-between',
  PURGE_LABEL_GROUP: 'flex items-center gap-2',
  PURGE_ICON: 'w-4 h-4 text-red-500',

  // Storage Summary
  SUMMARY_GRID: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  SUMMARY_CARD: 'p-4 flex items-center justify-between bg-card border-border/50',
  SUMMARY_LABEL: 'text-sm text-muted-foreground mb-1',
  SUMMARY_VALUE_WRAPPER: 'flex items-baseline gap-2',
  SUMMARY_VALUE_HOT: 'text-2xl font-bold text-blue-500',
  SUMMARY_VALUE_ARCHIVE: 'text-2xl font-bold text-purple-500',
  SUMMARY_META: 'text-xs text-muted-foreground',
  SUMMARY_ICON_HOT: 'w-8 h-8 text-blue-500/20',
  SUMMARY_ICON_ARCHIVE: 'w-8 h-8 text-purple-500/20',

  // Other settings (Appearance, Notifications)
  OTHER_SETTINGS_CARD: 'p-0',
  OTHER_SETTINGS_HEADER: 'px-5 py-4 border-b border-border flex items-center gap-3 bg-muted/30',
  OTHER_SETTINGS_ICON_WRAPPER: 'w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center',
  OTHER_SETTINGS_ICON: 'w-4 h-4',
  OTHER_SETTINGS_TITLE: 'font-semibold text-foreground',
  OTHER_SETTINGS_BODY: 'divide-y divide-border',
  OTHER_SETTINGS_ROW: 'px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors',
  OTHER_SETTINGS_LABEL: 'font-medium text-foreground',
  OTHER_SETTINGS_DESCRIPTION: 'text-sm text-muted-foreground',
  THEME_BUTTON_GROUP: 'flex gap-2',
  THEME_BUTTON: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
  THEME_BUTTON_ACTIVE: 'bg-primary/10 text-primary',
  THEME_BUTTON_INACTIVE: 'bg-muted text-muted-foreground hover:bg-muted/80',
  THEME_ICON: 'w-4 h-4 inline mr-2',
};
