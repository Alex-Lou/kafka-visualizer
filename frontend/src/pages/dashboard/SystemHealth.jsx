import { Heart, Clock } from 'lucide-react';
import { Badge } from '@components/common';
import { DASHBOARD } from '@constants/styles/dashboard';
import { HealthBadge } from './HealthBadge';
import { MemoryBar } from './MemoryBar';

export function SystemHealth({ health, wsConnected }) {
  if (!health) return null;

  return (
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
        <Metric value={health.metrics?.throughputPerSecond || 0} label="msg/sec" />
        <Metric value={health.metrics?.messagesLastMinute || 0} label="Last minute" />
        <Metric value={health.metrics?.messagesLastHour || 0} label="Last hour" />
        <Metric value={health.metrics?.activeConsumers || 0} label="Consumers" />
        <Metric value={health.metrics?.monitoredTopics || 0} label="Topics" />
        <Metric value={health.metrics?.jvmMemoryUsed || 0} label="MB Memory" />
      </div>

      {health.metrics && (
        <MemoryBar
          used={health.metrics.jvmMemoryUsed}
          max={health.metrics.jvmMemoryMax}
        />
      )}
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className={DASHBOARD.SYSTEM_METRIC}>
      <p className={DASHBOARD.SYSTEM_METRIC_VALUE}>{value}</p>
      <p className={DASHBOARD.SYSTEM_METRIC_LABEL}>{label}</p>
    </div>
  );
}
