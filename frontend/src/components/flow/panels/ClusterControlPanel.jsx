import { useState } from 'react';
import { X, Power, PowerOff, Settings, Trash2, ExternalLink, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { Button, Badge } from '@components/common';
import { connectionApi } from '@services/api';

export function ClusterControlPanel({ node, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [label, setLabel] = useState(node.data.label || '');
  const [sublabel, setSublabel] = useState(node.data.sublabel || '');
  const [color, setColor] = useState(node.data.color || '#3b82f6');

  const handleSave = () => {
    onUpdate(node.id, {
      ...node.data,
      label,
      sublabel,
      color,
    });
    setIsEditing(false);
  };

  const handleTestConnection = async () => {
    if (!node.data.connectionId) {
      alert('No connection ID found for this cluster');
      return;
    }

    setIsTogglingStatus(true);
    try {
      // Utiliser l'API test qui existe déjà
      const response = await connectionApi.test(node.data.connectionId);
      const connectionData = response.data || response;
      
      // Mapper le status backend vers le status frontend
      const newStatus = connectionData.status === 'CONNECTED' ? 'active' : 
                        connectionData.status === 'ERROR' ? 'error' : 'inactive';

      // Update node status in the UI
      onUpdate(node.id, {
        ...node.data,
        status: newStatus,
      });

      const statusMessage = connectionData.status === 'CONNECTED' 
        ? 'Connection successful!' 
        : `Connection status: ${connectionData.status}`;
      
      alert(statusMessage);
      
    } catch (error) {
      console.error('Error testing connection:', error);
      
      // Update to error state
      onUpdate(node.id, {
        ...node.data,
        status: 'error',
      });
      
      alert(`Connection test failed: ${error.message}`);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete cluster "${node.data.label}"?`)) {
      onDelete(node.id);
    }
  };

  // Détermine le variant du badge selon le status
  const getStatusBadge = () => {
    switch (node.data.status) {
      case 'active':
      case 'connected':
        return { variant: 'success', label: 'Connected' };
      case 'error':
        return { variant: 'danger', label: 'Error' };
      case 'connecting':
        return { variant: 'warning', label: 'Connecting...' };
      default:
        return { variant: 'secondary', label: 'Disconnected' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: color + '20', color }}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {node.data.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Kafka Cluster
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <div className="flex items-center gap-2">
              <Badge variant={statusBadge.variant}>
                {statusBadge.label}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                icon={isTogglingStatus ? Loader2 : RefreshCw}
                onClick={handleTestConnection}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
            {!node.data.connectionId && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ No connection ID - cannot test connection
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bootstrap Servers</label>
                <input
                  type="text"
                  value={sublabel}
                  onChange={(e) => setSublabel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full mt-1 h-10 bg-slate-900 border border-border rounded-lg cursor-pointer"
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
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bootstrap Servers</label>
                <p className="text-sm text-foreground mt-1">{node.data.sublabel || 'N/A'}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Configuration
              </Button>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground">Connection Details</label>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connection ID:</span>
                <span className="text-foreground font-mono">{node.data.connectionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Topics:</span>
                <span className="text-foreground">{node.data.topicsCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              icon={ExternalLink}
              onClick={() => window.open('/connections', '_blank')}
            >
              View in Connections
            </Button>
            {node.data.connectionId && (
              <Button
                variant="secondary"
                size="sm"
                icon={MessageSquare}
                onClick={() => window.open(`/messages?connectionId=${node.data.connectionId}`, '_blank')}
              >
                View Messages
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
              className="w-full"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}