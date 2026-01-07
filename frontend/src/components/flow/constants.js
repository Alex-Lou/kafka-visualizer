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