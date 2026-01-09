import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Trash2, BarChart3, MessageSquare, AlertTriangle, RefreshCw, Clock, Server, FileWarning, Activity } from 'lucide-react';
import { Button, Badge } from '@components/common';
import { STATUS, STATUS_COLORS } from '@components/flow/constants';

export function TopicControlPanel({ node, onClose, onUpdate, onDelete, onToggleMonitor }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.data.label || '');
  
  // ✅ État local pour les métriques temps réel
  const [metrics, setMetrics] = useState({
    messageCount: node.data.messageCount || 0,
    throughput: node.data.throughput || 0,
  });

  // ✅ Mettre à jour les métriques quand node.data change
  useEffect(() => {
    setMetrics({
      messageCount: node.data.messageCount || 0,
      throughput: node.data.throughput || 0,
    });
  }, [node.data.messageCount, node.data.throughput]);

  const handleSave = () => {
    onUpdate(node.id, { label });
    setIsEditing(false);
  };

  const handleToggleMonitor = async () => {
    try {
      await onToggleMonitor(node.data.topicId);
    } catch (error) {
      console.error('Failed to toggle monitor:', error);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete topic "${node.data.label}"?`)) {
      onDelete(node.id);
    }
  };

  const handleRetry = () => {
    // TODO: Implement retry logic
  };

  const statusColor = STATUS_COLORS[node.data.status] || '#6b7280';
  const isError = node.data.status === STATUS.ERROR;
  const errorData = node.data.error || {};

  // ✅ Indicateur de throughput actif
  const hasActivity = metrics.throughput > 0;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // ✅ Formater le throughput
  const formatThroughput = (value) => {
    if (!value || value === 0) return '0/s';
    if (value < 0.1) return '<0.1/s';
    if (value < 1) return `${value.toFixed(2)}/s`;
    if (value < 10) return `${value.toFixed(1)}/s`;
    return `${Math.round(value)}/s`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center relative"
              style={{ backgroundColor: statusColor + '20', color: statusColor }}
            >
              {isError ? <AlertTriangle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              {/* ✅ Indicateur d'activité */}
              {hasActivity && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {node.data.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Kafka Topic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status & Monitor Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Status</label>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${isError ? 'animate-pulse' : ''} ${hasActivity ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: hasActivity ? '#22c55e' : statusColor }}
                />
                <span className="text-sm text-foreground capitalize">
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

          {/* Error Section */}
          {isError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border-b border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Connection Error</span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-red-300/70">
                    <FileWarning className="w-3 h-3" />
                    <span>Error Message</span>
                  </div>
                  <p className="text-sm text-red-200 bg-red-500/10 rounded px-3 py-2 font-mono break-all">
                    {errorData.message || node.data.errorMessage || 'Unable to connect to Kafka broker.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {(errorData.code || node.data.errorCode) && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-red-300/70">
                        <Server className="w-3 h-3" />
                        <span>Error Code</span>
                      </div>
                      <p className="text-red-200 font-mono">
                        {errorData.code || node.data.errorCode}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-red-300/70">
                      <Clock className="w-3 h-3" />
                      <span>Occurred At</span>
                    </div>
                    <p className="text-red-200">
                      {formatTimestamp(errorData.timestamp || node.data.errorTimestamp)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleRetry}
                  className="w-full mt-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-300"
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          )}

          {/* ✅ METRICS - Amélioré avec indicateur d'activité */}
          <div className={`grid grid-cols-2 gap-3 p-3 rounded-lg ${isError ? 'bg-muted/50 opacity-60' : 'bg-muted'}`}>
            <div>
              <p className="text-xs text-muted-foreground">Messages</p>
              <p className="text-lg font-semibold text-foreground">
                {metrics.messageCount.toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">Throughput</p>
                {hasActivity && (
                  <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                )}
              </div>
              <p className={`text-lg font-semibold ${hasActivity ? 'text-green-500' : 'text-foreground'}`}>
                {formatThroughput(metrics.throughput)}
              </p>
            </div>
          </div>

          {/* ✅ Indicateur temps réel */}
          {node.data.monitored && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className={`w-2 h-2 rounded-full ${hasActivity ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className="text-xs text-blue-400">
                {hasActivity 
                  ? `Receiving ~${Math.round(metrics.throughput * 60)} msg/min` 
                  : 'Consumer active, waiting for messages...'}
              </span>
            </div>
          )}

          {/* Edit Section */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Topic Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic Details</label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topic ID:</span>
                  <span className="text-foreground font-mono">{node.data.topicId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-foreground">{node.data.topicName || 'N/A'}</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Label
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
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

          {/* Delete Button */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
              className="w-full"
            >
              Delete from Flow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}