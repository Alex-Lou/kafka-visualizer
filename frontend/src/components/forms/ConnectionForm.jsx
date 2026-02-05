import { useState } from 'react';
import { Button } from '@components/common';
import { INPUTS } from '@constants/styles/components';
import { useConnectionStore, useUIStore } from '@context/store/index';

export default function ConnectionForm({ connection, onClose }) {
  const { createConnection, updateConnection } = useConnectionStore();
  const { addToast, addNotification } = useUIStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: connection?.name || '',
    bootstrapServers: connection?.bootstrapServers || 'localhost:9092',
    description: connection?.description || '',
    defaultConnection: connection?.defaultConnection || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (connection) {
        await updateConnection(connection.id, formData);
        // 🎉 Toast pour feedback immédiat
        addToast({
          type: 'success',
          title: 'Updated',
          message: `${formData.name} saved`,
        });
        // 🔔 Notification dans l'historique
        addNotification({
          type: 'success',
          title: 'Connection Updated',
          message: `"${formData.name}" configuration has been updated`,
        });
      } else {
        await createConnection(formData);
        // 🎉 Toast pour feedback immédiat
        addToast({
          type: 'success',
          title: 'Created',
          message: `${formData.name} created successfully`,
        });
        // 🔔 Notification dans l'historique
        addNotification({
          type: 'success',
          title: 'Connection Created',
          message: `"${formData.name}" has been added to your connections`,
        });
      }
      onClose();
      // Reload page to refresh connections with correct IDs
      window.location.reload();
    } catch (error) {
      // 🎉 Toast pour l'erreur
      addToast({
        type: 'error',
        title: connection ? 'Update Failed' : 'Creation Failed',
        message: error.message || 'An error occurred',
      });
      // 🔔 Notification d'erreur dans l'historique
      addNotification({
        type: 'error',
        title: connection ? 'Update Failed' : 'Creation Failed',
        message: error.message || 'An error occurred while saving the connection',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Connection Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="My Kafka Cluster"
          className={`${INPUTS.BASE} bg-black text-white`}
        />
      </div>

      {/* Bootstrap Servers */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Bootstrap Servers *
        </label>
        <input
          type="text"
          name="bootstrapServers"
          value={formData.bootstrapServers}
          onChange={handleChange}
          required
          placeholder="localhost:9092"
          className={`${INPUTS.BASE} bg-black text-white`}
        />
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
          Format: host:port (e.g., localhost:9092)
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Production cluster for order processing..."
          className={`${INPUTS.BASE} bg-black text-white`}
        />
      </div>

      {/* Default Connection */}
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="defaultConnection"
            checked={formData.defaultConnection}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 bg-surface-100 border-surface-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-surface-800 focus:ring-2 dark:bg-surface-700 dark:border-surface-600"
          />
          <span className="ml-2 text-sm text-surface-700 dark:text-surface-300">
            Set as default connection
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : connection ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
