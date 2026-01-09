import { Handle, Position } from 'reactflow';
import { Server, Zap, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { STATUS, STATUS_COLORS, NODE_STATUS_CONFIG } from '../constants';
import { FLOW } from '@constants/styles/flow';

export default function ApplicationNode({ id, data, selected }) {
  const status = data.status || STATUS.ACTIVE;
  const statusColor = STATUS_COLORS[status];
  
  const StatusIcon = () => {
    switch (status) {
      case STATUS.ERROR:
        return <XCircle className={FLOW.ICON_MD} />;
      case STATUS.WARNING:
        return <AlertCircle className={FLOW.ICON_MD} />;
      case STATUS.CONNECTING:
        return <Loader2 className={`${FLOW.ICON_MD} animate-spin`} />;
      case STATUS.INACTIVE:
        return <Server className={`${FLOW.ICON_LG} opacity-50`} />;
      default:
        return <Server className={FLOW.ICON_LG} />;
    }
  };
  
  const getNodeClasses = () => {
    if (selected) {
      return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_PRIMARY} ${FLOW.NODE_BORDER_PRIMARY} ${FLOW.NODE_SELECTED} ${FLOW.NODE_SHADOW_PRIMARY}`;
    }
    if (status !== STATUS.ACTIVE) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_BASE} ${config.bgColor} ${config.borderColor} ${FLOW.NODE_SELECTED} ${config.shadowColor}`;
    }
    return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_ACTIVE} ${FLOW.NODE_BORDER_ACTIVE} shadow-md ${FLOW.NODE_HOVER} hover:${FLOW.NODE_BORDER_PRIMARY}`;
  };
  
  const getIconClasses = () => {
    if (selected) return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_SELECTED}`;
    if (status !== STATUS.ACTIVE) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_ICON_BASE} ${config.iconBgColor} text-white`;
    }
    return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_ACTIVE}`;
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
          <StatusIcon />
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
      
      {data.throughput !== undefined && data.throughput > 0 && (
        <div className={`${FLOW.NODE_METRICS} ${FLOW.NODE_METRICS_BORDER_SURFACE}`}>
          <div className={FLOW.NODE_METRICS_ROW}>
            <Zap className={`${FLOW.ICON_SM} text-primary-500`} />
            <span className={`font-medium ${FLOW.NODE_METRICS_TEXT_PRIMARY}`}>
              {data.throughput}/s
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
            {status === STATUS.ERROR && <span className={FLOW.NODE_BADGE_TEXT}>!</span>}
            {status === STATUS.WARNING && <span className={FLOW.NODE_BADGE_TEXT}>⚠</span>}
            {status === STATUS.CONNECTING && <Loader2 className={`${FLOW.ICON_SM} text-white animate-spin`} />}
            {status === STATUS.INACTIVE && <span className={FLOW.NODE_BADGE_TEXT}>○</span>}
          </div>
        </div>
      )}
      
      {(status === STATUS.ERROR || status === STATUS.WARNING) && data.statusMessage && (
        <div className={`${FLOW.NODE_METRICS} border-t border-current/20`}>
          <div className="text-[10px] font-medium truncate" style={{ color: statusColor }}>
            {data.statusMessage}
          </div>
        </div>
      )}
    </div>
  );
}