import { Server } from 'lucide-react';
import { Card, Badge } from '@components/common';
import { DASHBOARD } from '@constants/styles/dashboard';

export function ActiveConnections({ connections, stats }) {
  const getConnectionStatusClass = (status) => {
    if (status === 'CONNECTED') {
      return 'bg-success-50 dark:bg-success-500/20 text-success-600';
    }
    return 'bg-surface-100 dark:bg-surface-800 text-surface-500';
  };

  return (
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
                <div className={`${DASHBOARD.ACTIVITY_ITEM_ICON} ${getConnectionStatusClass(c.status)}`}>
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
  );
}
