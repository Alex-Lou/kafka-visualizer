// Flow constants and configurations

export const NODE_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
];

export const NODE_TYPE_COLORS = {
  application: '#3b82f6',
  topic: '#06b6d4',
  consumerGroup: '#8b5cf6',
  database: '#f59e0b',
};

export const PALETTE_ITEMS = [
  { type: 'application', label: 'App', color: 'primary' },
  { type: 'topic', label: 'Topic', color: 'accent' },
  { type: 'consumerGroup', label: 'Consumer', color: 'secondary' },
  { type: 'database', label: 'Database', color: 'warning' },
];

export const DEFAULT_EDGE_OPTIONS = {
  type: 'laser',
  animated: true,
  data: { active: true },
};

export const getNodeDefaults = (type) => {
  switch (type) {
    case 'application':
      return { label: 'New App', sublabel: 'Producer/Consumer' };
    case 'topic':
      return { label: 'New Topic', messageCount: 0 };
    case 'consumerGroup':
      return { label: 'Consumer Group', members: 1 };
    case 'database':
      return { label: 'Database', sublabel: 'MySQL/PostgreSQL' };
    default:
      return { label: 'New Node' };
  }
};


// ========================================
// STATUS SYSTEM
// ========================================

export const STATUS = {
  ACTIVE: 'active',           // Messages actifs, monitoring ON
  CONNECTED: 'connected',     // Connecté mais sans messages, monitoring ON
  UNMONITORED: 'unmonitored', // 🆕 Topic non monitoré (monitoring OFF)
  INACTIVE: 'inactive',       // Pas connecté / déconnecté
  ERROR: 'error',             // Erreur de connexion
  WARNING: 'warning',
  CONNECTING: 'connecting',
};

export const STATUS_COLORS = {
  [STATUS.ACTIVE]: '#3b82f6',      // Bleu vif pour actif avec messages
  [STATUS.CONNECTED]: '#22c55e',   // Vert pour connecté sans messages
  [STATUS.UNMONITORED]: '#64748b', // 🆕 Gris-bleu slate pour non-monitoré
  [STATUS.INACTIVE]: '#6b7280',    // Gris pour inactif/déconnecté
  [STATUS.ERROR]: '#ef4444',       // Rouge pour erreur
  [STATUS.WARNING]: '#f59e0b',     // Orange pour warning
  [STATUS.CONNECTING]: '#3b82f6',  // Bleu pour connexion en cours
};

export const EDGE_ANIMATIONS = {
  [STATUS.ACTIVE]: {
    particleDuration: '2s',
    glowEffect: true,
    pulseAnimation: 'pulse',
    strokeWidth: 3,
    opacity: 1,
  },
  [STATUS.CONNECTED]: {
    particleDuration: '3s',
    glowEffect: true,
    pulseAnimation: 'pulse',
    strokeWidth: 2.5,
    opacity: 0.9,
  },
  // 🆕 UNMONITORED : particule lente, glow subtil, aspect "en pause"
  [STATUS.UNMONITORED]: {
    particleDuration: '6s',        // Particule très lente
    glowEffect: true,              // Glow subtil pour rester visible
    pulseAnimation: 'breathe',     // Animation douce de respiration
    strokeWidth: 2,
    opacity: 0.5,                  // Semi-transparent
    particleOpacity: 0.6,          // Particule plus discrète
    dashArray: '8,4',              // Trait en pointillés longs
  },
  [STATUS.INACTIVE]: {
    particleDuration: '6s',
    glowEffect: false,
    pulseAnimation: 'none',
    strokeWidth: 2,
    opacity: 0.4,
  },
  [STATUS.ERROR]: {
    particleDuration: '1.5s',
    glowEffect: true,
    pulseAnimation: 'ping',
    strokeWidth: 3,
    opacity: 1,
  },
  [STATUS.WARNING]: {
    particleDuration: '3s',
    glowEffect: true,
    pulseAnimation: 'pulse-slow',
    strokeWidth: 2.5,
    opacity: 0.8,
  },
  [STATUS.CONNECTING]: {
    particleDuration: '2.5s',
    glowEffect: true,
    pulseAnimation: 'spin',
    strokeWidth: 2,
    opacity: 0.7,
  },
};

export const NODE_STATUS_CONFIG = {
  [STATUS.ACTIVE]: {
    borderColor: 'border-primary-500',
    bgColor: 'bg-primary-50 dark:bg-primary-900/40',
    iconBgColor: 'bg-primary-500',
    shadowColor: 'shadow-primary-500/30',
    indicatorClass: 'animate-pulse',
  },
  [STATUS.CONNECTED]: {
    borderColor: 'border-success-500',
    bgColor: 'bg-success-50 dark:bg-success-900/40',
    iconBgColor: 'bg-success-500',
    shadowColor: 'shadow-success-500/30',
    indicatorClass: 'animate-pulse',
  },
  // 🆕 UNMONITORED : style "en pause" mais toujours visible
  [STATUS.UNMONITORED]: {
    borderColor: 'border-slate-400 dark:border-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    iconBgColor: 'bg-slate-400',
    shadowColor: 'shadow-slate-500/20',
    indicatorClass: 'animate-breathe opacity-60',
  },
  [STATUS.INACTIVE]: {
    borderColor: 'border-surface-300 dark:border-surface-600',
    bgColor: 'bg-surface-50 dark:bg-surface-800',
    iconBgColor: 'bg-surface-400',
    shadowColor: 'shadow-surface-500/20',
    indicatorClass: 'opacity-50',
  },
  [STATUS.ERROR]: {
    borderColor: 'border-danger-500',
    bgColor: 'bg-danger-50 dark:bg-danger-900/40',
    iconBgColor: 'bg-danger-500',
    shadowColor: 'shadow-danger-500/40',
    indicatorClass: 'animate-ping',
  },
  [STATUS.WARNING]: {
    borderColor: 'border-warning-500',
    bgColor: 'bg-warning-50 dark:bg-warning-900/40',
    iconBgColor: 'bg-warning-500',
    shadowColor: 'shadow-warning-500/30',
    indicatorClass: 'animate-pulse-slow',
  },
  [STATUS.CONNECTING]: {
    borderColor: 'border-primary-400',
    bgColor: 'bg-primary-50 dark:bg-primary-900/30',
    iconBgColor: 'bg-primary-400',
    shadowColor: 'shadow-primary-500/30',
    indicatorClass: 'animate-spin',
  },
};