import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  notifications: [],
  wsConnected: false,
  notificationSettings: { messageAlerts: true, connectionStatus: true },

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

  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({ notifications: [...state.notifications, { ...notification, id }] }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  updateNotificationSettings: (settings) => {
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings },
    }));
  },
}));
