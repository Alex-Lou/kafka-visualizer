// persistence.js - Gestion localStorage et auto-save
// ===================================================

// Constantes
export const STORAGE_KEY = 'kafka-flow-visualizer';
export const EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes
export const AUTO_SAVE_INTERVAL = 30 * 1000; // 30 secondes
export const MAX_HISTORY_SIZE = 20;

// ===================================================
// LocalStorage avec expiration
// ===================================================

export const createExpiringStorage = () => ({
  getItem: (name) => {
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // Vérifie si expiré (10 min)
      if (parsed.timestamp && now - parsed.timestamp > EXPIRATION_TIME) {
        localStorage.removeItem(name);
        console.log('[FlowStore] Session expirée, localStorage vidé');
        return null;
      }

      return JSON.stringify(parsed.state);
    } catch (error) {
      console.error('[FlowStore] Erreur lecture localStorage:', error);
      return null;
    }
  },

  setItem: (name, value) => {
    try {
      const item = {
        state: JSON.parse(value),
        timestamp: Date.now(),
      };
      localStorage.setItem(name, JSON.stringify(item));
    } catch (error) {
      console.error('[FlowStore] Erreur écriture localStorage:', error);
    }
  },

  removeItem: (name) => {
    localStorage.removeItem(name);
  },
});

// ===================================================
// Session marker (détecte nouvelle session/onglet)
// ===================================================

const SESSION_MARKER = 'kafka-flow-session-active';

export const initSessionMarker = () => {
  if (!sessionStorage.getItem(SESSION_MARKER)) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.timestamp && Date.now() - parsed.timestamp > EXPIRATION_TIME) {
          localStorage.removeItem(STORAGE_KEY);
          console.log('[FlowStore] Données expirées supprimées');
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }
  sessionStorage.setItem(SESSION_MARKER, 'true');
};

// ===================================================
// Auto-save manager
// ===================================================

let autoSaveInterval = null;
let autoSaveCallback = null;

export const startAutoSave = (callback) => {
  stopAutoSave();
  autoSaveCallback = callback;
  autoSaveInterval = setInterval(() => {
    if (autoSaveCallback) {
      autoSaveCallback();
    }
  }, AUTO_SAVE_INTERVAL);
  console.log('[FlowStore] Auto-save démarré (toutes les 30s)');
};

export const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    autoSaveCallback = null;
    console.log('[FlowStore] Auto-save arrêté');
  }
};

export const setupAutoSaveCleanup = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopAutoSave);
  }
};