import { create } from 'zustand';
import { authApi, setUnauthorizedHandler } from '@services/api';
import { getAuthToken, setAuthToken } from '@services/authToken';
import wsService from '@services/websocket';

const persistedToken = getAuthToken();

export const useAuthStore = create((set, get) => ({
  token: persistedToken,
  user: null,                          // { username, role }
  isAuthenticated: !!persistedToken,   // optimiste : token présent en sessionStorage
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      // L'intercepteur axios renvoie response.data => { success, data: { token, username, role, ... } }
      const res = await authApi.login({ username, password });
      const data = res?.data ?? res;
      const token = data?.token;
      if (!token) throw new Error('Reponse de login invalide');

      setAuthToken(token);
      set({
        token,
        user: { username: data.username, role: data.role },
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return true;
    } catch (e) {
      setAuthToken(null);
      set({
        token: null, user: null, isAuthenticated: false,
        loading: false, error: e?.message || 'Echec de connexion',
      });
      return false;
    }
  },

  logout: () => {
    setAuthToken(null);
    try { wsService.disconnect(); } catch (_) { /* noop */ }
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  // Au démarrage : si un token persiste, on recharge l'utilisateur et on valide le token.
  // Token invalide/expiré -> déconnexion (l'app retombe sur l'écran de login).
  init: async () => {
    if (!getAuthToken()) return;
    try {
      const res = await authApi.me();
      const data = res?.data ?? res;
      set({ user: { username: data.username, role: data.role }, isAuthenticated: true });
    } catch (_) {
      get().logout();
    }
  },
}));

// Token expiré/invalide (401 renvoyé par l'API) -> déconnexion automatique.
setUnauthorizedHandler(() => {
  const { isAuthenticated, logout } = useAuthStore.getState();
  if (isAuthenticated) logout();
});
