import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar, NotificationToast } from '@components/common';
import { DashboardPage, ConnectionsPage, TopicsPage, MessagesPage, FlowPage, SettingsPage, AnalyticsPage, ArchivesPage, UsersPage } from '@pages';
import LoginPage from './pages/Login/LoginPage';
import { useUIStore, useConnectionStore, useTopicStore, useAuthStore, initializeWebSocket, subscribeToWsStatus } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';

export default function App() {
  const { sidebarCollapsed, setWsConnected } = useUIStore();
  const { fetchConnections } = useConnectionStore();
  const { fetchAllTopics } = useTopicStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [appReady, setAppReady] = useState(false);

  // Au montage : si un token persiste (sessionStorage), on revalide la session
  // pour survivre à un rafraîchissement de page sans repasser par le login.
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const initApp = async () => {
      await fetchConnections();
      await initializeWebSocket();
      await fetchAllTopics();
      setAppReady(true);
    };

    initApp();

    const unsubscribe = subscribeToWsStatus((connected) => {
      setWsConnected(connected);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  // Tant que l'utilisateur n'est pas connecté, on n'affiche que l'écran de login.
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className={LAYOUT.APP_SHELL}>
      <Sidebar />
      <div className={sidebarCollapsed ? LAYOUT.CONTENT_WRAPPER + ' ' + LAYOUT.CONTENT_WRAPPER_COLLAPSED : LAYOUT.CONTENT_WRAPPER}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/flow" element={<FlowPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <NotificationToast />
    </div>
  );
}
