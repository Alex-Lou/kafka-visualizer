import { Handle, Position } from 'reactflow';
import { Server, Zap } from 'lucide-react';

export default function ApplicationNode({ id, data, selected }) {
  return (
    <div
      className={`px-4 py-3 rounded-2xl border-2 min-w-[160px] transition-all duration-200 relative ${
        selected
          ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-500 shadow-lg shadow-primary-500/30'
          : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-md hover:shadow-lg hover:border-primary-300'
      }`}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary-500 !border-2 !border-white dark:!border-surface-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary-500 !border-2 !border-white dark:!border-surface-800"
      />
      
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            selected
              ? 'bg-primary-500 text-white'
              : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
          }`}
          style={data.color ? { backgroundColor: data.color + '20', color: data.color } : {}}
        >
          <Server className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-surface-900 dark:text-white truncate">
            {data.label}
          </div>
          {data.sublabel && (
            <div className="text-xs text-surface-500 dark:text-surface-400">
              {data.sublabel}
            </div>
          )}
        </div>
      </div>
      {data.throughput !== undefined && data.throughput > 0 && (
        <div className="mt-2 pt-2 border-t border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-1 text-xs">
            <Zap className="w-3 h-3 text-primary-500" />
            <span className="font-medium text-primary-600 dark:text-primary-400">
              {data.throughput}/s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}