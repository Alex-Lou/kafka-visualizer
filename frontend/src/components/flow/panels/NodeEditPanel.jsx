import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Palette, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@components/common';
import { NODE_COLORS } from '../constants';

export default function NodeEditPanel({ node, onUpdate, onDelete, onClose }) {
  const [label, setLabel] = useState(node?.data?.label || '');
  const [sublabel, setSublabel] = useState(node?.data?.sublabel || '');
  const [color, setColor] = useState(node?.data?.color || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '');
      setSublabel(node.data?.sublabel || '');
      setColor(node.data?.color || '');
      setShowDeleteConfirm(false);
    }
  }, [node?.id]);

  if (!node) return null;

  const handleSave = () => {
    onUpdate(node.id, {
      ...node.data,
      label,
      sublabel,
      color: color || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(node.id);
    onClose();
  };

  const isTopicNode = node.type === 'topic';
  const isLinkedToRealTopic = node.data?.topicId;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden z-20">
      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-primary-500" />
          <h3 className="font-semibold text-surface-900 dark:text-white">Edit Node</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Warning for linked topics */}
        {isLinkedToRealTopic && (
          <div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/30 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
            <p className="text-warning-700 dark:text-warning-300">
              This topic is linked to a real Kafka topic. Changes here won't affect Kafka.
            </p>
          </div>
        )}

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Sublabel */}
        {!isTopicNode && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={sublabel}
              onChange={(e) => setSublabel(e.target.value)}
              placeholder="e.g., Producer, Consumer..."
              className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {/* Color picker */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-surface-500" />
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Color
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setColor('')}
              className={`w-8 h-8 rounded-lg border-2 border-dashed transition-all ${
                !color ? 'border-primary-500 bg-surface-100 dark:bg-surface-700' : 'border-surface-300 dark:border-surface-600 hover:border-surface-400'
              }`}
              title="Default"
            >
              {!color && <Check className="w-4 h-4 mx-auto text-primary-500" />}
            </button>
            {NODE_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-lg transition-all ${
                  color === c.value ? 'ring-2 ring-offset-2 ring-surface-400 dark:ring-offset-surface-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Node info */}
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-surface-500">Type</span>
            <span className="text-surface-900 dark:text-white capitalize">{node.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">ID</span>
            <span className="text-surface-900 dark:text-white font-mono">{node.id}</span>
          </div>
          {node.data?.topicId && (
            <div className="flex justify-between">
              <span className="text-surface-500">Topic ID</span>
              <span className="text-surface-900 dark:text-white font-mono">{node.data.topicId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850">
        {showDeleteConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-surface-600 dark:text-surface-400">Delete this node?</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button size="sm" onClick={handleDelete} className="flex-1 bg-error-600 hover:bg-error-700 text-white">
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
              className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30"
            >
              Delete
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}