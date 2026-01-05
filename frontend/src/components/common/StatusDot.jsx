import { STATUS_DOTS } from '@constants/styles/components';

const statusMap = {
  connected: STATUS_DOTS.CONNECTED,
  disconnected: STATUS_DOTS.DISCONNECTED,
  error: STATUS_DOTS.ERROR,
  connecting: STATUS_DOTS.CONNECTING,
  pending: STATUS_DOTS.PENDING,
};

export default function StatusDot({ status = 'disconnected', className = '' }) {
  const statusClasses = statusMap[status.toLowerCase()] || statusMap.disconnected;

  return <span className={`${STATUS_DOTS.BASE} ${statusClasses} ${className}`} />;
}
