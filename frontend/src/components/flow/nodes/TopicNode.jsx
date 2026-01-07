import { Handle, Position } from 'reactflow';
import { MessageSquare, Zap } from 'lucide-react';

export default function TopicNode({ id, data, selected }) {
  const isActive = (data.messageCount || 0) > 0 || data.throughput > 0;
  
  return (
    <div
      className={`px-4 py-3 rounded-2xl border-2 min-w-[150px] transition-all duration-200 relative ${
        selected
          ? 'bg-accent-50 dark:bg-accent-900/40 border-accent-500 shadow-lg shadow-accent-500/30'
          : isActive
            ? 'bg-accent-50/50 dark:bg-accent-900/20 border-accent-400 dark:border-accent-600 shadow-md hover:shadow-lg'
            : 'bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-600 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent-500 !border-2 !border-white dark:!border-surface-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-accent-500 !border-2 !border-white dark:!border-surface-800"
      />
      
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            selected
              ? 'bg-accent-500 text-white'
              : isActive
                ? 'bg-accent-200 dark:bg-accent-800 text-accent-600 dark:text-accent-400'
                : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
          }`}
          style={data.color ? { backgroundColor: data.color + '20', color: data.color } : {}}
        >
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-surface-900 dark:text-white truncate">
            {data.label}
          </div>
          <div className="text-xs text-surface-500 dark:text-surface-400">
            {data.messageCount?.toLocaleString() || 0} msgs
          </div>
        </div>
      </div>
      {data.throughput !== undefined && data.throughput > 0 && (
        <div className="mt-2 pt-2 border-t border-accent-200 dark:border-accent-800">
          <div className="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400">
            <Zap className="w-3 h-3" />
            <span className="font-medium">{data.throughput}/s</span>
          </div>
        </div>
      )}
      {data.monitored && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 border-white dark:border-surface-800" />
      )}
    </div>
  );
}