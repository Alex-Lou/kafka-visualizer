import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, MessageSquare, Activity, TrendingUp, RefreshCw, Heart, Database, Cpu, Clock, Zap } from 'lucide-react';
import { Header, Card, Badge, Button } from '@components/common';
import { LoadingSection } from '@components/common/LoadingSpinner';
import { useDashboardStore, useConnectionStore, useUIStore } from '@context/store';
import { healthApi } from '@services/api';
import { DASHBOARD } from '@constants/styles/dashboard';
import { LAYOUT } from '@constants/styles/layout';

// Health status badge component
function HealthBadge({ status }) {
  const statusClass = status === 'UP' 
    ? DASHBOARD.HEALTH_STATUS_UP 
    : status === 'DOWN' 
      ? DASHBOARD.HEALTH_STATUS_DOWN 
      : DASHBOARD.HEALTH_STATUS_DEGRADED;
  
  return (
    <span className={DASHBOARD.HEALTH_STATUS_BADGE + ' ' + statusClass}>
      {status}
    </span>
  );
}

// Memory usage bar component
function MemoryBar({ used, max }) {
  const percentage = Math.round((used / max) * 100);
  const barClass = percentage > 80 
    ? DASHBOARD.MEMORY_BAR_DANGER 
    : percentage > 60 
      ? DASHBOARD.MEMORY_BAR_WARNING 
      : DASHBOARD.MEMORY_BAR_OK;
  
  return (
    <div className={DASHBOARD.MEMORY_BAR_CONTAINER}>
      <div className={DASHBOARD.MEMORY_BAR_LABEL}>
        <span>Memory Usage</span>
        <span>{used} MB / {max} MB ({percentage}%)</span>
      </div>
      <div className={DASHBOARD.MEMORY_BAR_BG}>
        <div 
          className={DASHBOARD.MEMORY_BAR_FILL + ' ' + barClass}
          style={{ width: percentage + '%' }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, isLoading, fetchStats } = useDashboardStore();
  const { connections, fetchConnections } = useConnectionStore();
  const { wsConnected } = useUIStore();
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch health data
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

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStats(),
        fetchConnections(),
        fetchHealth()
      ]);
      setInitialLoading(false);
    };
    loadData();
  }, []);

  // Refresh health every 10 seconds (lightweight call for uptime/memory)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setHealthLoading(true);
    await Promise.all([
      fetchStats(),
      fetchHealth()
    ]);
    setHealthLoading(false);
  };

  const statCards = [
    { label: 'Total Connections', value: stats?.totalConnections || 0, icon: Server, iconBg: DASHBOARD.STAT_CARD_ICON_PRIMARY, onClick: () => navigate('/connections') },
    { label: 'Monitored Topics', value: stats?.monitoredTopics || 0, icon: MessageSquare, iconBg: DASHBOARD.STAT_CARD_ICON_ACCENT, onClick: () => navigate('/topics') },
    { label: 'Messages (24h)', value: stats?.messagesLast24h?.toLocaleString() || 0, icon: Activity, iconBg: DASHBOARD.STAT_CARD_ICON_SECONDARY, onClick: () => navigate('/messages') },
    { label: 'Total Messages', value: stats?.totalMessages?.toLocaleString() || 0, icon: TrendingUp, iconBg: DASHBOARD.STAT_CARD_ICON_SUCCESS, onClick: () => navigate('/messages') },
  ];

  const getConnectionStatusClass = (status) => {
    if (status === 'CONNECTED') {
      return 'bg-success-50 dark:bg-success-500/20 text-success-600';
    }
    return 'bg-surface-100 dark:bg-surface-800 text-surface-500';
  };

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
              <div className="flex items-center gap-2 text-xs text-warning-500">
                <span className="w-2 h-2 rounded-full bg-warning-500"></span>
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
        {/* System Health Overview */}
        {health && (
          <div className={DASHBOARD.SYSTEM_CARD}>
            <div className={DASHBOARD.SYSTEM_HEADER}>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-primary-500" />
                <h3 className={DASHBOARD.SYSTEM_TITLE}>System Health</h3>
                <HealthBadge status={health.status} />
                {wsConnected && (
                  <Badge variant="success" size="sm">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse mr-1.5"></span>
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Uptime: {health.uptime}
                </span>
                <span>v{health.version}</span>
              </div>
            </div>
            
            <div className={DASHBOARD.SYSTEM_GRID}>
              <div className={DASHBOARD.SYSTEM_METRIC}>
                <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>
                  {health.metrics?.throughputPerSecond || 0}
                </p>
                <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>msg/sec</p>
              </div>
              <div className={DASHBOARD.SYSTEM_METRIC}>
                <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>
                  {health.metrics?.messagesLastMinute || 0}
                </p>
                <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>Last minute</p>
              </div>
              <div className={DASHBOARD.SYSTEM_METRIC}>
                <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>
                  {health.metrics?.messagesLastHour || 0}
                </p>
                <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>Last hour</p>
              </div>
              <div className={DASHBOARD.SYSTEM_METRIC}>
                <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>
                  {health.metrics?.activeConsumers || 0}
                </p>
                <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>Consumers</p>
              </div>
              <div className={DASHBOARD.SYSTEM_METRIC}>
                <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>
                  {health.metrics?.monitoredTopics || 0}
                </p>
                <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>Topics</p>
              </div>
              <div className={DASHBOARD.SYSTEM_METRIC}>
                <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>
                  {health.metrics?.jvmMemoryUsed || 0}
                  <span className={DASHBOARD.SYSTEM_METRIC_LABEL}>MB</span>
                </p>
                <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>Memory</p>
              </div>
            </div>

            {health.metrics && (
              <MemoryBar 
                used={health.metrics.jvmMemoryUsed} 
                max={health.metrics.jvmMemoryMax} 
              />
            )}
          </div>
        )}

        {/* Health Components */}
        {health && (
          <div className={DASHBOARD.HEALTH_SECTION}>
            <div className={DASHBOARD.HEALTH_GRID}>
              {/* Database Health */}
              <div className={DASHBOARD.HEALTH_CARD}>
                <div className={DASHBOARD.HEALTH_CARD_HEADER}>
                  <span className={DASHBOARD.HEALTH_CARD_TITLE}>
                    <Database className="w-4 h-4 inline mr-2" />
                    Database
                  </span>
                  <HealthBadge status={health.database?.status} />
                </div>
                <div className={DASHBOARD.HEALTH_CARD_BODY}>
                  <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                    <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Status</span>
                    <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{health.database?.message}</span>
                  </div>
                  {health.database?.details && (
                    <>
                      <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                        <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Connections</span>
                        <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{health.database.details.connections}</span>
                      </div>
                      <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                        <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Topics</span>
                        <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{health.database.details.topics}</span>
                      </div>
                      <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                        <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Messages</span>
                        <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{health.database.details.messages?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Kafka Health */}
              <div className={DASHBOARD.HEALTH_CARD}>
                <div className={DASHBOARD.HEALTH_CARD_HEADER}>
                  <span className={DASHBOARD.HEALTH_CARD_TITLE}>
                    <Zap className="w-4 h-4 inline mr-2" />
                    Kafka
                  </span>
                  <HealthBadge status={health.kafka?.status} />
                </div>
                <div className={DASHBOARD.HEALTH_CARD_BODY}>
                  <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                    <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Status</span>
                    <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{health.kafka?.message}</span>
                  </div>
                  {health.kafka?.details && (
                    <>
                      <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                        <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Active</span>
                        <span className={DASHBOARD.HEALTH_STATUS_VALUE}>
                          {health.kafka.details.activeConnections} / {health.kafka.details.totalConnections}
                        </span>
                      </div>
                      {health.kafka.details.connectionNames?.length > 0 && (
                        <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                          <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Clusters</span>
                          <span className={DASHBOARD.HEALTH_STATUS_VALUE}>
                            {health.kafka.details.connectionNames.join(', ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Consumers Health */}
              <div className={DASHBOARD.HEALTH_CARD}>
                <div className={DASHBOARD.HEALTH_CARD_HEADER}>
                  <span className={DASHBOARD.HEALTH_CARD_TITLE}>
                    <Cpu className="w-4 h-4 inline mr-2" />
                    Consumers
                  </span>
                  <HealthBadge status={health.consumers?.status} />
                </div>
                <div className={DASHBOARD.HEALTH_CARD_BODY}>
                  <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                    <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Status</span>
                    <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{health.consumers?.message}</span>
                  </div>
                  {health.consumers?.details && (
                    <>
                      <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                        <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Active</span>
                        <span className={DASHBOARD.HEALTH_STATUS_VALUE}>
                          {health.consumers.details.activeConsumers} / {health.consumers.details.monitoredTopics}
                        </span>
                      </div>
                      <div className={DASHBOARD.HEALTH_STATUS_ROW}>
                        <span className={DASHBOARD.HEALTH_STATUS_LABEL}>Running</span>
                        <span className={DASHBOARD.HEALTH_STATUS_VALUE}>
                          {Object.values(health.consumers.details.consumerStatus || {}).filter(s => s === 'RUNNING').length} threads
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - These update in real-time via WebSocket */}
        <div className={DASHBOARD.STATS_GRID}>
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={DASHBOARD.STAT_CARD + ' cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-xl'}
              onClick={stat.onClick}
              title={'Go to ' + stat.label}
            >
              <div className={DASHBOARD.STAT_CARD_ICON_WRAPPER + ' ' + stat.iconBg}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className={DASHBOARD.STAT_CARD_LABEL}>{stat.label}</p>
              <p className={DASHBOARD.STAT_CARD_VALUE + ' transition-all duration-300'}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Connections */}
        <Card padding="none">
          <div className={DASHBOARD.ACTIVITY_HEADER}>
            <h3 className={DASHBOARD.CHART_TITLE}>Active Connections</h3>
            <Badge variant="success">{stats?.activeConnections || 0} Online</Badge>
          </div>
          <div className={DASHBOARD.ACTIVITY_LIST}>
            {connections.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                No connections configured yet
              </div>
            ) : (
              connections.slice(0, 5).map((c) => (
                <div key={c.id} className={DASHBOARD.ACTIVITY_ITEM}>
                  <div className="flex items-center gap-4">
                    <div className={DASHBOARD.ACTIVITY_ITEM_ICON + ' ' + getConnectionStatusClass(c.status)}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div className={DASHBOARD.ACTIVITY_ITEM_CONTENT}>
                      <p className={DASHBOARD.ACTIVITY_ITEM_TITLE}>{c.name}</p>
                      <p className={DASHBOARD.ACTIVITY_ITEM_DESCRIPTION}>{c.bootstrapServers}</p>
                    </div>
                    <Badge variant={c.status === 'CONNECTED' ? 'success' : 'neutral'}>
                      {c.status}
                    </Badge>
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