import { Server, MessageSquare, AlertTriangle, Wand2 } from 'lucide-react';
import { Button, Badge } from '@components/common';

export default function AutoGenerateModal({ topics, connections, onConfirm, onCancel }) {
  const monitoredTopics = topics.filter(t => t.monitored);
  const activeConnections = connections.filter(c => c.status === 'CONNECTED');

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
              <p className="text-sm text-surface-500">From your monitored topics</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            This will create a flow diagram with:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-surface-700 dark:text-surface-300">Connections</span>
              </div>
              <Badge variant="primary">{activeConnections.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent-500" />
                <span className="text-sm text-surface-700 dark:text-surface-300">Monitored Topics</span>
              </div>
              <Badge variant="accent">{monitoredTopics.length}</Badge>
            </div>
          </div>

          {monitoredTopics.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5" />
              <p className="text-sm text-warning-700 dark:text-warning-300">
                No monitored topics found. Enable monitoring on topics first.
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
            disabled={monitoredTopics.length === 0}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}   