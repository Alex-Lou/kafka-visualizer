import { LayoutGrid, FileText, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@components/common';

export default function FlowListModal({ flows, onSelect, onCreate, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-900 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Flow Diagrams</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {flows.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
              <p className="text-surface-500">No saved diagrams</p>
              <Button variant="primary" size="sm" onClick={onCreate} className="mt-4">
                Create New
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {flows.map((flow) => (
                <div
                  key={flow.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => onSelect(flow)}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-surface-900 dark:text-white">{flow.name}</div>
                    <div className="text-xs text-surface-500">
                      Updated {new Date(flow.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(flow.id);
                    }}
                    className="p-2 rounded-lg text-surface-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex justify-between">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={Plus} onClick={onCreate}>New Diagram</Button>
        </div>
      </div>
    </div>
  );
}