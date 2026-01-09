import { Handle, Position } from 'reactflow';
import { MessageSquare, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { STATUS, STATUS_COLORS, NODE_STATUS_CONFIG } from '../constants';
import { FLOW } from '@constants/styles/flow';

export default function TopicNode({ id, data, selected }) {
  // Auto-detect status based on message activity
  const determineStatus = () => {
    // Si un statut est explicitement fourni, l'utiliser
    if (data.status) return data.status;
    
    // Sinon, déterminer automatiquement
    const hasMessages = (data.messageCount || 0) > 0;
    const hasThroughput = (data.throughput || 0) > 0;
    
    if (hasMessages || hasThroughput) {
      return STATUS.ACTIVE;
    }
    return STATUS.INACTIVE;
  };
  
  const status = determineStatus();
  const statusColor = STATUS_COLORS[status];
  const isActive = status === STATUS.ACTIVE;
  
  const StatusIcon = () => {
    switch (status) {
      case STATUS.ERROR:
        return <AlertCircle className={FLOW.STATUS_ICON_ERROR} />;
      case STATUS.WARNING:
        return <AlertCircle className={FLOW.STATUS_ICON_WARNING} />;
      case STATUS.CONNECTING:
        return <Loader2 className={FLOW.STATUS_ICON_CONNECTING} />;
      case STATUS.INACTIVE:
        return <div className="w-2 h-2 bg-surface-400 rounded-full opacity-50" />;
      default:
        return <div className={`w-2 h-2 ${FLOW.NODE_BADGE_DOT_SUCCESS} rounded-full animate-pulse`} />;
    }
  };
  
  const getNodeClasses = () => {
    if (selected) {
      return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_ACCENT} ${FLOW.NODE_BORDER_ACCENT} ${FLOW.NODE_SELECTED} ${FLOW.NODE_SHADOW_ACCENT}`;
    }
    if (status === STATUS.ERROR || status === STATUS.WARNING || status === STATUS.CONNECTING) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_BASE} ${config.bgColor} ${config.borderColor} ${FLOW.NODE_SELECTED} ${config.shadowColor}`;
    }
    if (status === STATUS.INACTIVE) {
      return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_SURFACE} ${FLOW.NODE_BORDER_SURFACE} shadow-md opacity-60 ${FLOW.NODE_HOVER}`;
    }
    // ACTIVE
    return `${FLOW.NODE_BASE} ${FLOW.NODE_BG_ACCENT_LIGHT} ${FLOW.NODE_BORDER_ACCENT_ALT} shadow-md ${FLOW.NODE_HOVER}`;
  };
  
  const getIconClasses = () => {
    if (selected) return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_ACCENT_SELECTED}`;
    if (status === STATUS.ERROR || status === STATUS.WARNING || status === STATUS.CONNECTING) {
      const config = NODE_STATUS_CONFIG[status];
      return `${FLOW.NODE_ICON_BASE} ${config.iconBgColor} text-white`;
    }
    if (status === STATUS.INACTIVE) {
      return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_ACCENT_INACTIVE}`;
    }
    // ACTIVE
    return `${FLOW.NODE_ICON_BASE} ${FLOW.NODE_ICON_BG_ACCENT}`;
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
          <MessageSquare className={FLOW.ICON_LG} />
        </div>
        <div className={FLOW.NODE_TEXT_CONTAINER}>
          <div className={FLOW.NODE_LABEL}>{data.label}</div>
          <div className={status === STATUS.INACTIVE ? 'text-xs text-surface-400 italic' : FLOW.NODE_SUBLABEL}>
            {status === STATUS.INACTIVE ? 'No messages' : `${data.messageCount?.toLocaleString() || 0} msgs`}
          </div>
        </div>
      </div>
      
      {data.throughput !== undefined && data.throughput > 0 && (
        <div className={`${FLOW.NODE_METRICS} ${FLOW.NODE_METRICS_BORDER_ACCENT}`}>
          <div className={`${FLOW.NODE_METRICS_ROW} ${FLOW.NODE_METRICS_TEXT_ACCENT}`}>
            <Zap className={FLOW.ICON_SM} />
            <span className="font-medium">{data.throughput}/s</span>
          </div>
        </div>
      )}
      
      <div className={FLOW.NODE_BADGE_CONTAINER}>
        {status === STATUS.ACTIVE && data.monitored && (
          <div className={`${FLOW.NODE_BADGE_DOT} ${FLOW.NODE_BADGE_DOT_SUCCESS}`} />
        )}
        {(status === STATUS.ERROR || status === STATUS.WARNING || status === STATUS.CONNECTING) && <StatusIcon />}
      </div>
      
      {status !== STATUS.ACTIVE && status !== STATUS.INACTIVE && (
        <div className={FLOW.NODE_STATUS_LABEL}>
          <div 
            className={FLOW.NODE_STATUS_LABEL_INNER}
            style={{ backgroundColor: statusColor }}
          >
            {status.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}