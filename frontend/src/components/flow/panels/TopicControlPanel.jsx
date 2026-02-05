import { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Trash2, 
  BarChart3, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Server, 
  FileWarning, 
  Activity 
} from 'lucide-react';
import { Button, Badge } from '@components/common';
import { STATUS, STATUS_COLORS } from '@components/flow/constants';
import { useTopicStore, useUIStore } from '@context/store';
import * as styles from '@constants/styles/flow/topicControlPanel';

export function TopicControlPanel({ node, onClose, onUpdate, onDelete, onToggleMonitor }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.data.label || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { addToast, addNotification } = useUIStore();
  
  // Se connecter directement au topicStore pour les métriques temps réel
  const topicFromStore = useTopicStore(state => 
    state.topics.find(t => t.id === node.data.topicId)
  );

  // Métriques combinées: priorité au store (temps réel), fallback sur node.data
  const metrics = {
    messageCount: topicFromStore?.messageCount ?? node.data.messageCount ?? 0,
    throughput: topicFromStore?.throughput ?? node.data.throughput ?? 0,
    throughputPerMinute: topicFromStore?.throughputPerMinute ?? node.data.throughputPerMinute ?? 0,
    messagesLastMinute: topicFromStore?.messagesLastMinute ?? node.data.messagesLastMinute ?? 0,
    consumerActive: topicFromStore?.consumerActive ?? node.data.consumerActive ?? false,
    lastMessageAt: topicFromStore?.lastMessageAt ?? node.data.lastMessageAt,
  };

  // Handlers
  const handleSave = () => {
    onUpdate(node.id, { label });
    setIsEditing(false);
    // 🎉 Toast pour feedback
    addToast({
      type: 'success',
      title: 'Updated',
      message: 'Topic label updated',
    });
  };

  const handleToggleMonitor = async () => {
    try {
      await onToggleMonitor(node.data.topicId);
      // 🎉 Toast pour feedback immédiat
      addToast({
        type: 'success',
        title: node.data.monitored ? 'Monitoring Disabled' : 'Monitoring Enabled',
        message: node.data.monitored ? 'Stopped tracking this topic' : 'Now tracking this topic',
      });
    } catch (error) {
      console.error('Failed to toggle monitor:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to toggle monitoring',
      });
    }
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    onDelete(node.id);
    // 🎉 Toast pour feedback immédiat
    addToast({
      type: 'success',
      title: 'Removed',
      message: 'Topic removed from flow',
    });
    // 🔔 Notification dans l'historique
    addNotification({
      type: 'info',
      title: 'Topic Removed from Flow',
      message: `"${node.data.label}" removed from flow visualization`,
    });
    onClose();
  };

  const handleRetry = () => {
    // TODO: Implement retry logic
    addToast({
      type: 'info',
      title: 'Retrying',
      message: 'Attempting to reconnect...',
    });
  };

  // Derived state
  const statusColor = STATUS_COLORS[node.data.status] || '#6b7280';
  const isError = node.data.status === STATUS.ERROR;
  const errorData = node.data.error || {};
  const hasActivity = metrics.throughput > 0;

  // Formatters
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatThroughput = (value) => {
    if (!value || value === 0) return '0/s';
    if (value < 0.1) return '<0.1/s';
    if (value < 1) return `${value.toFixed(2)}/s`;
    if (value < 10) return `${value.toFixed(1)}/s`;
    return `${Math.round(value)}/s`;
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 5) return 'just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return formatTimestamp(timestamp);
    } catch {
      return null;
    }
  };

  // Realtime indicator text
  const getRealtimeText = () => {
    if (hasActivity) {
      return `Receiving ~${Math.round(metrics.throughput * 60)} msg/min`;
    }
    if (metrics.consumerActive) {
      return 'Consumer active, waiting for messages...';
    }
    return 'Consumer inactive';
  };

  return (
    <div className={styles.MODAL_OVERLAY} onClick={onClose}>
      <div className={styles.MODAL_CONTAINER} onClick={(e) => e.stopPropagation()}>
        
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className={styles.HEADER_WRAPPER}>
          <div className={styles.HEADER_CONTENT}>
            <div 
              className={styles.HEADER_ICON_WRAPPER_BASE}
              style={styles.getHeaderIconWrapperStyle(statusColor)}
            >
              {isError 
                ? <AlertTriangle className={styles.HEADER_ICON} /> 
                : <MessageSquare className={styles.HEADER_ICON} />
              }
              {hasActivity && (
                <span className={styles.HEADER_ACTIVITY_INDICATOR} />
              )}
            </div>
            <div>
              <h3 className={styles.HEADER_TITLE}>{node.data.label}</h3>
              <p className={styles.HEADER_SUBTITLE}>Kafka Topic</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.HEADER_CLOSE_BUTTON}>
            <X className={styles.HEADER_CLOSE_ICON} />
          </button>
        </div>

        <div className={styles.BODY_WRAPPER}>
          
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* STATUS & MONITOR TOGGLE */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className={styles.STATUS_SECTION}>
            <div className={styles.STATUS_LABEL_WRAPPER}>
              <label className={styles.STATUS_LABEL}>Status</label>
              <div className={styles.STATUS_INDICATOR_WRAPPER}>
                <div 
                  className={styles.getStatusDotClass(isError, hasActivity)}
                  style={styles.getStatusDotStyle(hasActivity, statusColor)}
                />
                <span className={styles.STATUS_TEXT}>
                  {hasActivity ? 'Active' : (node.data.status || 'unknown')}
                </span>
              </div>
            </div>
            <Button
              variant={node.data.monitored ? 'primary' : 'secondary'}
              size="sm"
              icon={node.data.monitored ? Eye : EyeOff}
              onClick={handleToggleMonitor}
            >
              {node.data.monitored ? 'Monitoring' : 'Not Monitored'}
            </Button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ERROR SECTION */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {isError && (
            <div className={styles.ERROR_CONTAINER}>
              <div className={styles.ERROR_HEADER}>
                <AlertTriangle className={styles.ERROR_HEADER_ICON} />
                <span className={styles.ERROR_HEADER_TEXT}>Connection Error</span>
              </div>
              
              <div className={styles.ERROR_BODY}>
                {/* Error Message */}
                <div className={styles.ERROR_MESSAGE_WRAPPER}>
                  <div className={styles.ERROR_MESSAGE_LABEL_WRAPPER}>
                    <FileWarning className={styles.ERROR_MESSAGE_LABEL_ICON} />
                    <span>Error Message</span>
                  </div>
                  <p className={styles.ERROR_MESSAGE_TEXT}>
                    {errorData.message || node.data.errorMessage || 'Unable to connect to Kafka broker.'}
                  </p>
                </div>

                {/* Error Details Grid */}
                <div className={styles.ERROR_DETAILS_GRID}>
                  {(errorData.code || node.data.errorCode) && (
                    <div className={styles.ERROR_DETAIL_WRAPPER}>
                      <div className={styles.ERROR_DETAIL_LABEL_WRAPPER}>
                        <Server className={styles.ERROR_DETAIL_LABEL_ICON} />
                        <span>Error Code</span>
                      </div>
                      <p className={styles.ERROR_DETAIL_VALUE}>
                        {errorData.code || node.data.errorCode}
                      </p>
                    </div>
                  )}

                  <div className={styles.ERROR_DETAIL_WRAPPER}>
                    <div className={styles.ERROR_DETAIL_LABEL_WRAPPER}>
                      <Clock className={styles.ERROR_DETAIL_LABEL_ICON} />
                      <span>Occurred At</span>
                    </div>
                    <p className={styles.ERROR_DETAIL_VALUE_NORMAL}>
                      {formatTimestamp(errorData.timestamp || node.data.errorTimestamp)}
                    </p>
                  </div>
                </div>

                {/* Retry Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleRetry}
                  className={styles.ERROR_RETRY_BUTTON}
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* METRICS - Main */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className={styles.getMetricsGridClass(isError)}>
            <div>
              <p className={styles.METRIC_LABEL}>Messages</p>
              <p className={styles.METRIC_VALUE}>
                {metrics.messageCount.toLocaleString()}
              </p>
            </div>
            <div>
              <div className={styles.METRIC_LABEL_WRAPPER}>
                <p className={styles.METRIC_LABEL}>Throughput</p>
                {hasActivity && (
                  <Activity className={styles.METRIC_ACTIVITY_ICON} />
                )}
              </div>
              <p className={styles.getMetricValueClass(hasActivity)}>
                {formatThroughput(metrics.throughput)}
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* METRICS - Extended */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {(metrics.messagesLastMinute > 0 || metrics.throughputPerMinute > 0) && (
            <div className={styles.METRICS_EXTENDED_GRID}>
              <div>
                <p className={styles.METRIC_LABEL}>Last Minute</p>
                <p className={styles.METRIC_VALUE_SMALL}>
                  {metrics.messagesLastMinute.toLocaleString()} msgs
                </p>
              </div>
              <div>
                <p className={styles.METRIC_LABEL}>Rate/min</p>
                <p className={styles.METRIC_VALUE_SMALL}>
                  {Math.round(metrics.throughputPerMinute)}/min
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* REALTIME INDICATOR */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {node.data.monitored && (
            <div className={styles.REALTIME_WRAPPER}>
              <div className={styles.REALTIME_CONTENT}>
                <div className={styles.getRealtimeDotClass(hasActivity, metrics.consumerActive)} />
                <span className={styles.REALTIME_TEXT}>
                  {getRealtimeText()}
                </span>
              </div>
              {metrics.lastMessageAt && (
                <span className={styles.REALTIME_TIMESTAMP}>
                  {formatRelativeTime(metrics.lastMessageAt)}
                </span>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* EDIT / DETAILS SECTION */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {isEditing ? (
            <div className={styles.EDIT_FORM_WRAPPER}>
              <div className={styles.EDIT_FIELD_WRAPPER}>
                <label className={styles.EDIT_FIELD_LABEL}>Topic Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={styles.EDIT_INPUT}
                />
              </div>
              <div className={styles.EDIT_BUTTONS_WRAPPER}>
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.DETAILS_WRAPPER}>
              <label className={styles.DETAILS_LABEL}>Topic Details</label>
              <div className={styles.DETAILS_LIST}>
                <div className={styles.DETAILS_ROW}>
                  <span className={styles.DETAILS_ROW_LABEL}>Topic ID:</span>
                  <span className={styles.DETAILS_ROW_VALUE}>{node.data.topicId || 'N/A'}</span>
                </div>
                <div className={styles.DETAILS_ROW}>
                  <span className={styles.DETAILS_ROW_LABEL}>Name:</span>
                  <span className={styles.DETAILS_ROW_VALUE_NORMAL}>{node.data.topicName || 'N/A'}</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Label
              </Button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ACTION BUTTONS */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className={styles.ACTIONS_GRID}>
            <Button
              variant="secondary"
              size="sm"
              icon={BarChart3}
              onClick={() => window.open(`/topics?id=${node.data.topicId}`, '_blank')}
            >
              View Metrics
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={MessageSquare}
              onClick={() => window.open(`/messages?topicId=${node.data.topicId}`, '_blank')}
            >
              View Messages
            </Button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* DELETE BUTTON */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className={styles.DELETE_SECTION}>
            {showDeleteConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Remove "{node.data.label}" from flow view?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
                className={styles.DELETE_BUTTON}
              >
                Delete from Flow
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
