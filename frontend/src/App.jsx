import { Routes, Route } from 'react-router-dom';
import { Sidebar, NotificationToast } from '@components/common';
import { DashboardPage, ConnectionsPage, TopicsPage, MessagesPage, FlowPage, SettingsPage } from '@pages';
import { useUIStore } from '@context/store';
import { LAYOUT } from '@constants/styles/layout';

export default function App() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className={LAYOUT.APP_SHELL}>
      <Sidebar />
      <div className={`${LAYOUT.CONTENT_WRAPPER} ${sidebarCollapsed ? LAYOUT.CONTENT_WRAPPER_COLLAPSED : ''}`}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/flow" element={<FlowPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <NotificationToast />
    </div>
  );
}
