import { Handle, Position } from 'reactflow';
import { Users } from 'lucide-react';

export default function ConsumerGroupNode({ id, data, selected }) {
  return (
    <div
      className={`px-4 py-3 rounded-2xl border-2 min-w-[160px] transition-all duration-200 relative ${
        selected
          ? 'bg-secondary-50 dark:bg-secondary-900/40 border-secondary-500 shadow-lg shadow-secondary-500/30'
          : 'bg-white dark:bg-surface-800 border-secondary-300 dark:border-secondary-700 shadow-md hover:shadow-lg hover:border-secondary-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-secondary-500 !border-2 !border-white dark:!border-surface-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-secondary-500 !border-2 !border-white dark:!border-surface-800"
      />
      
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            selected
              ? 'bg-secondary-500 text-white'
              : 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-600 dark:text-secondary-400'
          }`}
          style={data.color ? { backgroundColor: data.color + '20', color: data.color } : {}}
        >
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-surface-900 dark:text-white">
            {data.label}
          </div>
          {data.members && (
            <div className="text-xs text-surface-500 dark:text-surface-400">
              {data.members} members
            </div>
          )}
        </div>
      </div>
    </div>
  );
}