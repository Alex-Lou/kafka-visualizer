import { useState, useEffect } from 'react';
import { X, MessageSquare, Activity, Clock, Database, Edit3, Trash2, Save, Palette } from 'lucide-react';
import { Button, Badge } from '@components/common';
import { useTopicStore } from '@context/store/index';
import { topicApi } from '@services/api';

// Predefined colors for topics
const TOPIC_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
];

// CSS for slide animation - add this to your global CSS or tailwind config
const slideInStyle = {
  animation: 'slideInRight 0.3s ease-out',
};

export default function TopicDetailPanel({ topic, connection, onClose, onUpdate, onDelete }) {
  const { updateTopic } = useTopicStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    description: topic?.description || '',
    color: topic?.color || '#3B82F6',
    monitored: topic?.monitored || false,
  });

  // Reset form when topic changes
  useEffect(() => {
    if (topic) {
      setEditForm({
        description: topic.description || '',
        color: topic.color || '#3B82F6',
        monitored: topic.monitored || false,
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [topic?.id]);

  if (!topic) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTopic(topic.id, {
        description: editForm.description,
        color: editForm.color,
        monitored: editForm.monitored,
      });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update topic:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await topicApi.delete(topic.id);
      if (onDelete) onDelete(topic.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete topic:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleMonitored = async () => {
    const newMonitored = !editForm.monitored;
    setEditForm({ ...editForm, monitored: newMonitored });
    
    // If not in edit mode, save immediately
    if (!isEditing) {
      try {
        await updateTopic(topic.id, { monitored: newMonitored });
        if (onUpdate) onUpdate();
      } catch (error) {
        // Revert on error
        setEditForm({ ...editForm, monitored: !newMonitored });
      }
    }
  };

  const isActive = (topic.messageCount || 0) > 0;
  const isEmpty = (topic.messageCount || 0) === 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-surface-900 shadow-2xl z-50 overflow-hidden flex flex-col"
        style={slideInStyle}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: editForm.color + '20' }}
            >
              <MessageSquare className="w-5 h-5" style={{ color: editForm.color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                {topic.name}
              </h2>
              <p className="text-sm text-surface-500">{connection?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {editForm.monitored && <Badge variant="success">Monitored</Badge>}
            {isActive && <Badge variant="accent">Active</Badge>}
            {isEmpty && <Badge variant="neutral">Empty</Badge>}
            <Badge variant="secondary">{connection?.bootstrapServers}</Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Messages</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {topic.messageCount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-xs">Partitions</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {topic.partitions || '-'}
              </p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Last Message</span>
              </div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {topic.lastMessageAt 
                  ? new Date(topic.lastMessageAt).toLocaleString() 
                  : 'Never'}
              </p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <span className="text-xs">Replication</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {topic.replicationFactor || '-'}
              </p>
            </div>
          </div>

          {/* Monitoring Toggle */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-surface-900 dark:text-white">Monitoring</h3>
                <p className="text-sm text-surface-500">
                  {editForm.monitored 
                    ? 'Receiving real-time messages' 
                    : 'Not monitoring this topic'}
                </p>
              </div>
              <button
                onClick={handleToggleMonitored}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editForm.monitored ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editForm.monitored ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Description
              </label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Add a description for this topic..."
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            ) : (
              <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 min-h-[60px]">
                {topic.description || 'No description'}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-surface-500" />
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Color
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOPIC_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setEditForm({ ...editForm, color: color.value });
                    if (!isEditing) setIsEditing(true);
                  }}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    editForm.color === color.value 
                      ? 'ring-2 ring-offset-2 ring-surface-400 dark:ring-offset-surface-900' 
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Topic Info */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Topic Info
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Topic ID</span>
              <span className="text-surface-900 dark:text-white font-mono">{topic.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Connection ID</span>
              <span className="text-surface-900 dark:text-white font-mono">{topic.connectionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Created</span>
              <span className="text-surface-900 dark:text-white">
                {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850">
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Are you sure? This will remove all associated messages.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="flex-1 bg-error-600 hover:bg-error-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    description: topic.description || '',
                    color: topic.color || '#3B82F6',
                    monitored: topic.monitored || false,
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                onClick={handleSave}
                isLoading={isSaving}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Edit3}
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                Edit Topic
              </Button>
              <Button
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 hover:bg-error-200 dark:hover:bg-error-900/50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}