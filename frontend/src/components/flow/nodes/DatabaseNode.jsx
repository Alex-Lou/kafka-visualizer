import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';

export default function DatabaseNode({ id, data, selected }) {
  return (
    <div
      className={`px-4 py-3 rounded-2xl border-2 min-w-[140px] transition-all duration-200 relative ${
        selected
          ? 'bg-warning-50 dark:bg-warning-900/40 border-warning-500 shadow-lg shadow-warning-500/30'
          : 'bg-white dark:bg-surface-800 border-warning-300 dark:border-warning-700 shadow-md hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-warning-500 !border-2 !border-white dark:!border-surface-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-warning-500 !border-2 !border-white dark:!border-surface-800"
      />
      
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            selected
              ? 'bg-warning-500 text-white'
              : 'bg-warning-100 dark:bg-warning-900/50 text-warning-600 dark:text-warning-400'
          }`}
          style={data.color ? { backgroundColor: data.color + '20', color: data.color } : {}}
        >
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-surface-900 dark:text-white">
            {data.label}
          </div>
          {data.sublabel && (
            <div className="text-xs text-surface-500 dark:text-surface-400">
              {data.sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}