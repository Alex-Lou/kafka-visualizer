import { useEffect, useState } from 'react';
import { Plus, Server, MoreVertical, Play, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Header, Card, Button, Badge, StatusDot, Modal } from '@components/common';
import ConnectionForm from '@components/forms/ConnectionForm';
import { useConnectionStore, useUIStore } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';
import { CARDS, BUTTONS, INPUTS } from '@constants/styles/components';

export default function ConnectionsPage() {
  const { connections, isLoading, fetchConnections, testConnection, deleteConnection } = useConnectionStore();
  const { addToast, addNotification, notificationSettings } = useUIStore();
  const [showModal, setShowModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);

  useEffect(() => { fetchConnections(); }, []);

  const handleTest = async (id) => {
    try {
      const result = await testConnection(id);
      addToast({
        type: result.status === 'CONNECTED' ? 'success' : 'error',
        title: 'Connection Test',
        message: result.status === 'CONNECTED'
          ? `Connected to ${result.name}`
          : `Failed to connect to ${result.name}`,
      });
      if (notificationSettings.connectionStatus) {
        addNotification({
          type: result.status === 'CONNECTED' ? 'success' : 'error',
          title: result.status === 'CONNECTED' ? 'Connection Test Successful' : 'Connection Test Failed',
          message: result.status === 'CONNECTED'
            ? `Successfully connected to ${result.name}`
            : `Unable to connect to ${result.name}`,
        });
      }
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Test Failed',
        message: e.message || 'An error occurred',
      });
      if (notificationSettings.connectionStatus) {
        addNotification({
          type: 'error',
          title: 'Connection Test Error',
          message: e.message || 'An error occurred while testing the connection',
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        const conn = connections.find(c => c.id === id);
        await deleteConnection(id);
        addToast({
          type: 'success',
          title: 'Deleted',
          message: `${conn?.name || 'Connection'} removed`,
        });
        addNotification({
          type: 'warning',
          title: 'Connection Deleted',
          message: `"${conn?.name || 'Connection'}" has been permanently deleted`,
        });
      } catch (e) {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: e.message || 'Failed to delete',
        });
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: e.message || 'Failed to delete connection',
        });
      }
    }
  };

  return (
    <>
      <Header title="Connections" subtitle="Manage your Kafka cluster connections"
        actions={<Button variant="primary" size="sm" icon={Plus} onClick={() => setShowModal(true)}>Add Connection</Button>} />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={LAYOUT.GRID_3_COLS}>
          {connections.map((conn) => (
            <Card key={conn.id} variant="interactive" padding="none">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">{conn.name}</h3>
                      <p className="text-xs text-surface-500">{conn.bootstrapServers}</p>
                    </div>
                  </div>
                  <StatusDot status={conn.status} />
                </div>
                {conn.description && <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 line-clamp-2">{conn.description}</p>}
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <Badge variant={conn.status === 'CONNECTED' ? 'success' : conn.status === 'ERROR' ? 'error' : 'neutral'} size="sm">{conn.status}</Badge>
                  {conn.defaultConnection && <Badge variant="primary" size="sm">Default</Badge>}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs text-surface-400">{conn.topicCount} topics</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleTest(conn.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-success-500 hover:bg-surface-100 dark:hover:bg-surface-800"><Play className="w-4 h-4" /></button>
                  <button onClick={() => { setEditingConnection(conn); setShowModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(conn.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-error-500 hover:bg-surface-100 dark:hover:bg-surface-800"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
          {connections.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <Server className="w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">No connections yet</h3>
              <p className="text-surface-500 mb-6">Add your first Kafka connection to get started</p>
              <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>Add Connection</Button>
            </div>
          )}
        </div>
      </main>

      {/* Connection Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingConnection(null);
        }}
        title={editingConnection ? 'Edit Connection' : 'Add Connection'}
      >
        <ConnectionForm
          connection={editingConnection}
          onClose={() => {
            setShowModal(false);
            setEditingConnection(null);
          }}
        />
      </Modal>
    </>
  );
}
