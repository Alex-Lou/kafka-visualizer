import { Handle, Position } from 'reactflow';
import { Database, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { STATUS, STATUS_COLORS, NODE_STATUS_CONFIG } from '../constants';
import { FLOW } from '@constants/styles/flow';

export default function DatabaseNode({ id, data, selected }) {
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
    const baseClasses = `${FLOW.NODE_BASE} min-w-[140px]`;
    if (selected) {
      return `${baseClasses} ${FLOW.NODE_BG_WARNING} ${FLOW.NODE_BORDER_WARNING} ${FLOW.NODE_SELECTED} ${FLOW.NODE_SHADOW_WARNING}`;
    }
    if (status !== STATUS.ACTIVE) {
      const config = NODE_STATUS_CONFIG[status];
      return `${baseClasses} ${config.bgColor} ${config.borderColor} ${FLOW.NODE_SELECTED} ${config.shadowColor}`;
    }
    return `${baseClasses} ${FLOW.NODE_BG_ACTIVE} border-warning-300 dark:border-warning-700 shadow-md ${FLOW.NODE_HOVER}`;
  };
  
  const getIconClasses = () => {
    if (selected) return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_WARNING_SELECTED}`;
    if (status !== STATUS.ACTIVE) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_ICON_BASE} ${config.iconBgColor} text-white`;
    }
    return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_WARNING_NODE}`;
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
          <Database className={FLOW.ICON_LG} />
          {(status === STATUS.ERROR || status === STATUS.CONNECTING) && (
            <div 
              className={status === STATUS.ERROR ? FLOW.PULSE_RING : FLOW.PULSE_RING_ALT}
              style={{ backgroundColor: statusColor, opacity: 0.3 }}
            />
          )}
        </div>
        
        <div className={FLOW.NODE_TEXT_CONTAINER}>
          <div className={FLOW.NODE_LABEL}>{data.label}</div>
          {data.sublabel && (
            <div className={status === STATUS.ACTIVE ? FLOW.NODE_SUBLABEL : FLOW.NODE_SUBLABEL_ALT}>
              {data.sublabel}
            </div>
          )}
        </div>
      </div>
      
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
      
      {data.isReadOnly && (
        <div className={FLOW.NODE_BOTTOM_BADGE}>
          <div className={FLOW.NODE_BOTTOM_BADGE_SURFACE}>
            READ-ONLY
          </div>
        </div>
      )}
    </div>
  );
}