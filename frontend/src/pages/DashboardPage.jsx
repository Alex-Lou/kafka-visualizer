import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, MessageSquare, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { Header, Card, Badge, Button } from '@components/common';
import { useDashboardStore, useConnectionStore } from '@context/store';
import { DASHBOARD } from '@constants/styles/dashboard';
import { LAYOUT } from '@constants/styles/layout';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, isLoading, fetchStats } = useDashboardStore();
  const { connections, fetchConnections } = useConnectionStore();

  useEffect(() => {
    fetchStats();
    fetchConnections();
  }, []);

  const statCards = [
    { label: 'Total Connections', value: stats?.totalConnections || 0, icon: Server, iconBg: DASHBOARD.STAT_CARD_ICON_PRIMARY, onClick: () => navigate('/connections') },
    { label: 'Monitored Topics', value: stats?.monitoredTopics || 0, icon: MessageSquare, iconBg: DASHBOARD.STAT_CARD_ICON_ACCENT, onClick: () => navigate('/topics') },
    { label: 'Messages (24h)', value: stats?.messagesLast24h?.toLocaleString() || 0, icon: Activity, iconBg: DASHBOARD.STAT_CARD_ICON_SECONDARY, onClick: () => navigate('/messages') },
    { label: 'Total Messages', value: stats?.totalMessages?.toLocaleString() || 0, icon: TrendingUp, iconBg: DASHBOARD.STAT_CARD_ICON_SUCCESS, onClick: () => navigate('/messages') },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Monitor your Kafka ecosystem"
        actions={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchStats} isLoading={isLoading}>Refresh</Button>}
      />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={DASHBOARD.STATS_GRID}>
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={`${DASHBOARD.STAT_CARD} cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-xl`}
              onClick={stat.onClick}
              title={`Go to ${stat.label}`}
            >
              <div className={`${DASHBOARD.STAT_CARD_ICON_WRAPPER} ${stat.iconBg}`}><stat.icon className="w-6 h-6" /></div>
              <p className={DASHBOARD.STAT_CARD_LABEL}>{stat.label}</p>
              <p className={DASHBOARD.STAT_CARD_VALUE}>{stat.value}</p>
            </div>
          ))}
        </div>
        <Card padding="none">
          <div className={DASHBOARD.ACTIVITY_HEADER}><h3 className={DASHBOARD.CHART_TITLE}>Active Connections</h3><Badge variant="success">{stats?.activeConnections || 0} Online</Badge></div>
          <div className={DASHBOARD.ACTIVITY_LIST}>
            {connections.length === 0 ? (<div className="p-8 text-center text-surface-500">No connections configured yet</div>) : (
              connections.slice(0, 5).map((c) => (
                <div key={c.id} className={DASHBOARD.ACTIVITY_ITEM}>
                  <div className="flex items-center gap-4">
                    <div className={`${DASHBOARD.ACTIVITY_ITEM_ICON} ${c.status === 'CONNECTED' ? 'bg-success-50 dark:bg-success-500/20 text-success-600' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'}`}><Server className="w-5 h-5" /></div>
                    <div className={DASHBOARD.ACTIVITY_ITEM_CONTENT}><p className={DASHBOARD.ACTIVITY_ITEM_TITLE}>{c.name}</p><p className={DASHBOARD.ACTIVITY_ITEM_DESCRIPTION}>{c.bootstrapServers}</p></div>
                    <Badge variant={c.status === 'CONNECTED' ? 'success' : 'neutral'}>{c.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </>
  );
}
