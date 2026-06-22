// Porteur du JWT, adossé à sessionStorage :
// - survit à un rafraîchissement de page (F5) et aux reloads internes,
// - effacé à la fermeture de l'onglet et NON partagé entre onglets,
// - pas localStorage (proscrit par l'audit : exposition XSS persistante).
const KEY = 'yucast_token';

let _token = null;
try { _token = sessionStorage.getItem(KEY) || null; } catch (_) { _token = null; }

export const getAuthToken = () => _token;

export const setAuthToken = (t) => {
  _token = t || null;
  try {
    if (_token) sessionStorage.setItem(KEY, _token);
    else sessionStorage.removeItem(KEY);
  } catch (_) { /* sessionStorage indisponible : on garde au moins la valeur en mémoire */ }
};
