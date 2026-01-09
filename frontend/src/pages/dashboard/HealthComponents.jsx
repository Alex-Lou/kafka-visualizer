import { Database, Zap, Cpu } from 'lucide-react';
import { DASHBOARD } from '@constants/styles/dashboard';
import { HealthBadge } from './HealthBadge';

export function HealthComponents({ health }) {
  if (!health) return null;

  return (
    <div className={DASHBOARD.HEALTH_SECTION}>
      <div className={DASHBOARD.HEALTH_GRID}>
        <HealthCard
          title="Database"
          icon={Database}
          status={health.database?.status}
          message={health.database?.message}
          details={health.database?.details}
          detailLabels={{ connections: 'Connections', topics: 'Topics', messages: 'Messages' }}
        />
        <HealthCard
          title="Kafka"
          icon={Zap}
          status={health.kafka?.status}
          message={health.kafka?.message}
          details={health.kafka?.details}
          detailLabels={{ activeConnections: 'Active', totalConnections: 'Total', connectionNames: 'Clusters' }}
        />
        <HealthCard
          title="Consumers"
          icon={Cpu}
          status={health.consumers?.status}
          message={health.consumers?.message}
          details={health.consumers?.details}
          detailLabels={{ activeConsumers: 'Active', monitoredTopics: 'Monitored', consumerStatus: 'Running' }}
        />
      </div>
    </div>
  );
}

function HealthCard({ title, icon: Icon, status, message, details, detailLabels }) {
  return (
    <div className={DASHBOARD.HEALTH_CARD}>
      <div className={DASHBOARD.HEALTH_CARD_HEADER}>
        <span className={DASHBOARD.HEALTH_CARD_TITLE}>
          <Icon className="w-4 h-4 inline mr-2" />
          {title}
        </span>
        <HealthBadge status={status} />
      </div>
      <div className={DASHBOARD.HEALTH_CARD_BODY}>
        <HealthRow label="Status" value={message} />
        {details && Object.entries(detailLabels).map(([key, label]) => (
          details[key] && <HealthRow key={key} label={label} value={formatDetail(key, details[key])} />
        ))}
      </div>
    </div>
  );
}

function HealthRow({ label, value }) {
  return (
    <div className={DASHBOARD.HEALTH_STATUS_ROW}>
      <span className={DASHBOARD.HEALTH_STATUS_LABEL}>{label}</span>
      <span className={DASHBOARD.HEALTH_STATUS_VALUE}>{value}</span>
    </div>
  );
}

function formatDetail(key, value) {
  if (key === 'messages') return value.toLocaleString();
  if (key === 'connectionNames') return value.join(', ');
  if (key === 'consumerStatus') return `${Object.values(value).filter(s => s === 'RUNNING').length} threads`;
  return value;
}
