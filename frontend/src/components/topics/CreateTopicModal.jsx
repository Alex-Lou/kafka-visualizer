import { useState } from 'react';
import { Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@components/common';
import { useTopicStore, useUIStore } from '@context/store/index';
import { TOPICS as STYLES } from '@constants/styles/topics';

const PRESET_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export default function CreateTopicModal({ connectionId, connectionName, onClose, onSuccess }) {
  const { createTopic } = useTopicStore();
  const { addToast, addNotification } = useUIStore();
  
  const [formData, setFormData] = useState({
    name: '',
    partitions: 3,
    replicationFactor: 1,
    description: '',
    color: '#22c55e',
    monitored: true
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Topic name is required';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.name)) {
      newErrors.name = 'Topic name can only contain letters, numbers, dots, hyphens and underscores';
    }
    
    if (formData.partitions < 1) {
      newErrors.partitions = 'At least 1 partition is required';
    }
    
    if (formData.replicationFactor < 1) {
      newErrors.replicationFactor = 'Replication factor must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await createTopic(connectionId, formData);
      
      // 🎉 Toast pour feedback immédiat
      addToast({
        type: 'success',
        title: 'Created',
        message: `Topic "${formData.name}" created`,
      });
      
      // 🔔 Notification importante dans l'historique
      addNotification({
        type: 'success',
        title: 'Topic Created',
        message: `"${formData.name}" successfully created in Kafka with ${formData.partitions} partition(s)`
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      // 🎉 Toast pour l'erreur
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create topic'
      });
      
      // 🔔 Notification d'erreur dans l'historique
      addNotification({
        type: 'error',
        title: 'Topic Creation Failed',
        message: `Failed to create "${formData.name}": ${error.message || 'Unknown error'}`
      });
      
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className={STYLES.MODAL_BACKDROP} onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl border border-border max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create New Topic</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new Kafka topic on <Badge variant="secondary" size="sm">{connectionName}</Badge>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Topic Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Topic Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., orders-topic"
              className={`w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Partitions & Replication Factor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Partitions <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.partitions}
                onChange={(e) => handleChange('partitions', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border ${errors.partitions ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-white`}
                disabled={isSubmitting}
              />
              {errors.partitions && (
                <p className="text-xs text-red-500 mt-1">{errors.partitions}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                More partitions = better parallelism
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Replication Factor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.replicationFactor}
                onChange={(e) => handleChange('replicationFactor', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border ${errors.replicationFactor ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-white`}
                disabled={isSubmitting}
              />
              {errors.replicationFactor && (
                <p className="text-xs text-red-500 mt-1">{errors.replicationFactor}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Usually 1 for local, 2-3 for prod
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description of this topic..."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-10 h-10 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  disabled={isSubmitting}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Monitoring Toggle */}
          <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-foreground">Enable Monitoring</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Start tracking messages immediately after creation
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('monitored', !formData.monitored)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.monitored ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'}`}
              disabled={isSubmitting}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.monitored ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-500">Creation Failed</h4>
                <p className="text-sm text-red-500/80 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Topic
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
