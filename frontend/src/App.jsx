import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar, NotificationToast } from '@components/common';
import { DashboardPage, ConnectionsPage, TopicsPage, MessagesPage, FlowPage, SettingsPage, AnalyticsPage } from '@pages';
import { useUIStore, useConnectionStore, useTopicStore, initializeWebSocket, subscribeToWsStatus } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';

export default function App() {
  const { sidebarCollapsed, setWsConnected } = useUIStore();
  const { fetchConnections } = useConnectionStore();
  const { fetchAllTopics } = useTopicStore();
  const [appReady, setAppReady] = useState(false);

  // Initialize app on mount
  useEffect(() => {
    const initApp = async () => {

      // 1. Fetch initial data
      await fetchConnections();
      
      // 2. Initialize WebSocket for real-time updates
      await initializeWebSocket();
      
      // 3. Fetch all topics after connections are loaded
      await fetchAllTopics();
      
      setAppReady(true);
    };

    initApp();

    // Subscribe to WebSocket status changes
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
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <NotificationToast />
    </div>
  );
}