import { DASHBOARD } from '@constants/styles/dashboard';

export function MemoryBar({ used, max }) {
  const percentage = max > 0 ? Math.round((used / max) * 100) : 0;
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
          className={`${DASHBOARD.MEMORY_BAR_FILL} ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
