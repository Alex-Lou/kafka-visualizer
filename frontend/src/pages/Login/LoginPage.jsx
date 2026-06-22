import { useState } from 'react';
import { useAuthStore } from '@context/store/index';

export default function LoginPage() {
  const { login, loading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    await login(username.trim(), password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 space-y-5"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Yucast</h1>
          <p className="text-sm text-gray-400">Connectez-vous pour continuer</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm text-gray-300">Identifiant</label>
          <input
            id="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-gray-300">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 outline-none focus:border-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 font-medium transition"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
