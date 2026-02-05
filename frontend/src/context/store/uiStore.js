import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  
  // ═══════════════════════════════════════════════════════════════════════
  // TOASTS - Notifications temporaires (popups)
  // ═══════════════════════════════════════════════════════════════════════
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS - Historique persistant (cloche 🔔)
  // ═══════════════════════════════════════════════════════════════════════
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const id = Date.now();
    const newNotif = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotification: (id) => {
    set((state) => {
      const notif = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WEBSOCKET & AUTRES
  // ═══════════════════════════════════════════════════════════════════════
  wsConnected: false,
  notificationSettings: { 
    messageAlerts: false, // Désactivé par défaut (trop de messages)
    connectionStatus: true,
    flowErrors: true,
    systemEvents: true,
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setWsConnected: (connected) => set({ wsConnected: connected }),

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  updateNotificationSettings: (settings) => {
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings },
    }));
  },
}));
