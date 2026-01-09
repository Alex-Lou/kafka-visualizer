import { Server, MessageSquare, AlertTriangle, Wand2, CheckCircle, XCircle, Loader2, CircleOff } from 'lucide-react';
import { Button, Badge } from '@components/common';

// Helper pour mapper le statut
const getConnectionStatus = (connection) => {
  const status = connection?.status;
  switch (status) {
    case 'CONNECTED':
      return { variant: 'success', label: 'Connected', icon: CheckCircle };
    case 'ERROR':
      return { variant: 'danger', label: 'Error', icon: XCircle };
    case 'CONNECTING':
      return { variant: 'warning', label: 'Connecting', icon: Loader2 };
    default:
      return { variant: 'secondary', label: 'Unknown', icon: CircleOff };
  }
};

export default function AutoGenerateModal({ topics, connections, onConfirm, onCancel }) {
  const monitoredTopics = topics.filter(t => t.monitored);
  
  // Compter les connexions par statut
  const connectedCount = connections.filter(c => c.status === 'CONNECTED').length;
  const errorCount = connections.filter(c => c.status === 'ERROR').length;
  const otherCount = connections.length - connectedCount - errorCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-900 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                Auto-Generate Flow
              </h3>
              <p className="text-sm text-surface-500">From your connections & topics</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            This will create a flow diagram with:
          </p>

          <div className="space-y-2">
            {/* Connections avec détail par statut */}
            <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Connections</span>
                </div>
                <Badge variant="primary">{connections.length}</Badge>
              </div>
              
              {/* Breakdown par statut */}
              {connections.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                  {connectedCount > 0 && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {connectedCount} connected
                    </Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="danger" size="sm">
                      <XCircle className="w-3 h-3 mr-1" />
                      {errorCount} error
                    </Badge>
                  )}
                  {otherCount > 0 && (
                    <Badge variant="secondary" size="sm">
                      <CircleOff className="w-3 h-3 mr-1" />
                      {otherCount} other
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Liste des connexions individuelles */}
            {connections.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {connections.map((connection) => {
                  const statusInfo = getConnectionStatus(connection);
                  const StatusIcon = statusInfo.icon;
                  const topicsForConnection = topics.filter(
                    t => t.connectionId === connection.id && t.monitored
                  ).length;
                  
                  return (
                    <div 
                      key={connection.id}
                      className="flex items-center justify-between p-2 bg-surface-100 dark:bg-surface-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusIcon className={`w-4 h-4 flex-shrink-0 ${
                          statusInfo.variant === 'success' ? 'text-green-500' :
                          statusInfo.variant === 'danger' ? 'text-red-500' :
                          statusInfo.variant === 'warning' ? 'text-yellow-500 animate-spin' :
                          'text-gray-400'
                        }`} />
                        <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                          {connection.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {topicsForConnection > 0 && (
                          <span className="text-xs text-surface-500">
                            {topicsForConnection} topic{topicsForConnection > 1 ? 's' : ''}
                          </span>
                        )}
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Monitored Topics */}
            <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent-500" />
                <span className="text-sm text-surface-700 dark:text-surface-300">Monitored Topics</span>
              </div>
              <Badge variant="accent">{monitoredTopics.length}</Badge>
            </div>
          </div>

          {/* Warnings */}
          {connections.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-danger-50 dark:bg-danger-900/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-danger-500 mt-0.5" />
              <p className="text-sm text-danger-700 dark:text-danger-300">
                No connections found. Create a connection first.
              </p>
            </div>
          )}

          {errorCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5" />
              <p className="text-sm text-warning-700 dark:text-warning-300">
                {errorCount} connection{errorCount > 1 ? 's' : ''} in error state will appear in red.
              </p>
            </div>
          )}

          {monitoredTopics.length === 0 && connections.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-info-50 dark:bg-info-900/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-info-500 mt-0.5" />
              <p className="text-sm text-info-700 dark:text-info-300">
                No monitored topics. Only cluster nodes will be generated.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Wand2}
            onClick={onConfirm}
            disabled={connections.length === 0}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}