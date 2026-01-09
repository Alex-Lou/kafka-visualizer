import { Handle, Position } from 'reactflow';
import { Users, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { STATUS, STATUS_COLORS, NODE_STATUS_CONFIG } from '../constants';
import { FLOW } from '@constants/styles/flow';

export default function ConsumerGroupNode({ id, data, selected }) {
  const status = data.status || STATUS.ACTIVE;
  const statusColor = STATUS_COLORS[status];
  
  const StatusIcon = () => {
    switch (status) {
      case STATUS.ERROR:
        return <XCircle className={FLOW.STATUS_ICON_ERROR_WHITE} />;
      case STATUS.WARNING:
        return <AlertCircle className={`${FLOW.STATUS_ICON_ERROR_WHITE} animate-pulse-slow`} />;
      case STATUS.CONNECTING:
        return <Loader2 className={`${FLOW.STATUS_ICON_ERROR_WHITE} animate-spin`} />;
      default:
        return null;
    }
  };
  
  const getNodeClasses = () => {
    if (selected) {
      return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_SECONDARY} ${FLOW.NODE_BORDER_SECONDARY} ${FLOW.NODE_SELECTED} ${FLOW.NODE_SHADOW_SECONDARY}`;
    }
    if (status !== STATUS.ACTIVE) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_BASE} ${config.bgColor} ${config.borderColor} ${FLOW.NODE_SELECTED} ${config.shadowColor}`;
    }
    return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_ACTIVE} ${FLOW.NODE_BORDER_SECONDARY} shadow-md ${FLOW.NODE_HOVER} hover:border-secondary-400`;
  };
  
  const getIconClasses = () => {
    if (selected) return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_SECONDARY_SELECTED}`;
    if (status !== STATUS.ACTIVE) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_ICON_BASE} ${config.iconBgColor} text-white`;
    }
    return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_SECONDARY}`;
  };
  
  return (
    <div className={getNodeClasses()}>
      <Handle
        type="target"
        position={Position.Left}
        className={FLOW.HANDLE_BASE}
        style={{ backgroundColor: statusColor }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={FLOW.HANDLE_BASE}
        style={{ backgroundColor: statusColor }}
      />
      
      <div className={FLOW.NODE_CONTENT}>
        <div
          className={getIconClasses()}
          style={data.color && status === STATUS.ACTIVE ? { backgroundColor: data.color + '20', color: data.color } : {}}
        >
          <Users className={FLOW.ICON_LG} />
          {status === STATUS.ERROR && (
            <div 
              className={FLOW.PULSE_RING}
              style={{ backgroundColor: statusColor, opacity: 0.3 }}
            />
          )}
        </div>
        
        <div className={FLOW.NODE_TEXT_CONTAINER}>
          <div className={FLOW.NODE_LABEL}>{data.label}</div>
          {data.members && (
            <div className={status === STATUS.ACTIVE ? FLOW.NODE_SUBLABEL : FLOW.NODE_SUBLABEL_ALT}>
              {data.members} member{data.members > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      
      {data.lag !== undefined && (status === STATUS.WARNING || status === STATUS.ERROR) && (
        <div className={`${FLOW.NODE_METRICS} border-t border-current/20`}>
          <div className={FLOW.NODE_METRICS_ROW}>
            <AlertCircle className={FLOW.ICON_SM} style={{ color: statusColor }} />
            <span className="font-medium" style={{ color: statusColor }}>
              Lag: {data.lag.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      
      {status !== STATUS.ACTIVE && (
        <div className={FLOW.NODE_BADGE_CONTAINER_ALT}>
          <div 
            className={`${FLOW.NODE_BADGE_CIRCLE} ${NODE_STATUS_CONFIG[status].indicatorClass}`}
            style={{ backgroundColor: statusColor }}
          >
            <StatusIcon />
          </div>
        </div>
      )}
      
      {data.isRebalancing && (
        <div className={FLOW.NODE_BOTTOM_BADGE}>
          <div className={FLOW.NODE_BOTTOM_BADGE_PRIMARY}>
            <Loader2 className="w-2 h-2 animate-spin" />
            Rebalancing
          </div>
        </div>
      )}
    </div>
  );
}