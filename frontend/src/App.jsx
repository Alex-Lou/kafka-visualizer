import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar, NotificationToast } from '@components/common';
// J'ajoute UsersPage ici dans l'import
import { DashboardPage, ConnectionsPage, TopicsPage, MessagesPage, FlowPage, SettingsPage, AnalyticsPage, ArchivesPage, UsersPage } from '@pages';
import { useUIStore, useConnectionStore, useTopicStore, initializeWebSocket, subscribeToWsStatus } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';

export default function App() {
  const { sidebarCollapsed, setWsConnected } = useUIStore();
  const { fetchConnections } = useConnectionStore();
  const { fetchAllTopics } = useTopicStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
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
  }, []);

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