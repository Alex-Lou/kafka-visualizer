import { DASHBOARD } from '@constants/styles/dashboard';

export function HealthBadge({ status }) {
  const statusClass = status === 'UP'
    ? DASHBOARD.HEALTH_STATUS_UP
    : status === 'DOWN'
      ? DASHBOARD.HEALTH_STATUS_DOWN
      : DASHBOARD.HEALTH_STATUS_DEGRADED;

  return (
    <span className={`${DASHBOARD.HEALTH_STATUS_BADGE} ${statusClass}`}>
      {status}
    </span>
  );
}
