import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Server, MessageSquare, Activity, TrendingUp } from 'lucide-react';
import { Header, Button } from '@components/common';
import { LoadingSection } from '@components/common/LoadingSpinner';
import { useDashboardStore, useConnectionStore, useUIStore } from '@context/store/index';
import { healthApi } from '@services/api';
import { LAYOUT } from '@constants/styles/layout';
import { DASHBOARD } from '@constants/styles/dashboard';

import { SystemHealth } from './SystemHealth';
import { HealthComponents } from './HealthComponents';
import { StatCard } from './StatCard';
import { ActiveConnections } from './ActiveConnections';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, isLoading, fetchStats } = useDashboardStore();
  const { connections, fetchConnections } = useConnectionStore();
  const { wsConnected } = useUIStore();
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await healthApi.getHealth();
      setHealth(response.data || response);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchConnections(), fetchHealth()]);
      setInitialLoading(false);
    };
    loadData();
  }, [fetchStats, fetchConnections]);

  useEffect(() => {
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setHealthLoading(true);
    await Promise.all([fetchStats(), fetchHealth()]);
    setHealthLoading(false);
  };

  const statCardsData = [
    { label: 'Total Connections', value: stats?.totalConnections || 0, icon: Server, iconBg: DASHBOARD.STAT_CARD_ICON_PRIMARY, onClick: () => navigate('/connections') },
    { label: 'Monitored Topics', value: stats?.monitoredTopics || 0, icon: MessageSquare, iconBg: DASHBOARD.STAT_CARD_ICON_ACCENT, onClick: () => navigate('/topics') },
    { label: 'Messages (24h)', value: stats?.messagesLast24h?.toLocaleString() || 0, icon: Activity, iconBg: DASHBOARD.STAT_CARD_ICON_SECONDARY, onClick: () => navigate('/messages') },
    { label: 'Total Messages', value: stats?.totalMessages?.toLocaleString() || 0, icon: TrendingUp, iconBg: DASHBOARD.STAT_CARD_ICON_SUCCESS, onClick: () => navigate('/messages') },
  ];

  if (initialLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Monitor your Kafka ecosystem" />
        <main className={LAYOUT.PAGE_CONTENT}>
          <LoadingSection message="Loading dashboard data..." />
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Monitor your Kafka ecosystem"
        actions={
          <div className="flex items-center gap-4">
            {wsConnected ? (
              <div className={DASHBOARD.REFRESH_INDICATOR}>
                <span className={DASHBOARD.REFRESH_DOT}></span>
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-yellow-500">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span>Connecting...</span>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              isLoading={isLoading || healthLoading}
            >
              Refresh
            </Button>
          </div>
        }
      />
      <main className={LAYOUT.PAGE_CONTENT}>
        <SystemHealth health={health} wsConnected={wsConnected} />
        <HealthComponents health={health} />

        <div className={DASHBOARD.STATS_GRID}>
          {statCardsData.map((stat, i) => <StatCard key={i} {...stat} />)}
        </div>

        <ActiveConnections connections={connections} stats={stats} />
      </main>
    </>
  );
}
