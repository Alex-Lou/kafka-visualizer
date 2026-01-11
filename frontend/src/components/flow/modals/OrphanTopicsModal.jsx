import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle, XCircle, Loader2, Unplug, Server } from 'lucide-react';
import { Button, Badge } from '@components/common';
import { topicApi } from '@services/api';
import * as styles from '@constants/styles/flow/orphanTopicsModal';

export function OrphanTopicsModal({ onClose, onDeleted }) {
  const [orphans, setOrphans] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Charger les topics orphelins au montage
  useEffect(() => {
    loadOrphans();
  }, []);

  const loadOrphans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await topicApi.getOrphans();
      const data = response.data || response || [];
      setOrphans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load orphan topics');
      setOrphans([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers de sélection
  const handleToggle = (topicId) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(orphans.map(t => t.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Suppression
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmMessage = selectedIds.size === 1
      ? 'Are you sure you want to delete this orphan topic? This action cannot be undone.'
      : `Are you sure you want to delete ${selectedIds.size} orphan topics? This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const result = await topicApi.deleteOrphans(Array.from(selectedIds));
      const deleted = result.data?.deleted || result.deleted || selectedIds.size;
      
      // Callback pour notifier le parent
      onDeleted?.(deleted);
      
      // Recharger la liste
      await loadOrphans();
      setSelectedIds(new Set());
    } catch (err) {
      setError(err.message || 'Failed to delete orphan topics');
    } finally {
      setIsDeleting(false);
    }
  };

  // Formater le nombre de messages
  const formatMessageCount = (count) => {
    if (!count || count === 0) return '0 msgs';
    if (count < 1000) return `${count} msgs`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K msgs`;
    return `${(count / 1000000).toFixed(1)}M msgs`;
  };

  // Icône de statut de connexion
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ERROR':
        return <XCircle className="w-3 h-3" />;
      case 'DISCONNECTED':
        return <Unplug className="w-3 h-3" />;
      case 'DELETED':
        return <Trash2 className="w-3 h-3" />;
      default:
        return <Server className="w-3 h-3" />;
    }
  };

  return (
    <div className={styles.MODAL_OVERLAY}>
      <div className={styles.MODAL_CONTAINER}>
        {/* Header */}
        <div className={styles.HEADER_WRAPPER}>
          <div className={styles.HEADER_CONTENT}>
            <div className={styles.HEADER_ICON_WRAPPER}>
              <Trash2 className={styles.HEADER_ICON} />
            </div>
            <div>
              <h3 className={styles.HEADER_TITLE}>Orphan Topics</h3>
              <p className={styles.HEADER_SUBTITLE}>Topics without active connection</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.BODY_WRAPPER}>
          
          {/* Loading State */}
          {isLoading && (
            <div className={styles.LOADING_WRAPPER}>
              <Loader2 className={styles.LOADING_SPINNER} />
              <span className={styles.LOADING_TEXT}>Scanning for orphan topics...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className={styles.WARNING_BOX}>
              <AlertTriangle className={styles.WARNING_ICON} />
              <p className={styles.WARNING_TEXT}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && orphans.length === 0 && (
            <div className={styles.EMPTY_WRAPPER}>
              <div className={styles.EMPTY_ICON_WRAPPER}>
                <CheckCircle className={styles.EMPTY_ICON} />
              </div>
              <h4 className={styles.EMPTY_TITLE}>No orphan topics found</h4>
              <p className={styles.EMPTY_SUBTITLE}>
                All your topics are linked to active connections
              </p>
            </div>
          )}

          {/* Orphans List */}
          {!isLoading && !error && orphans.length > 0 && (
            <>
              <p className={styles.BODY_DESCRIPTION}>
                Found {orphans.length} topic{orphans.length > 1 ? 's' : ''} without an active connection. 
                Select the ones you want to delete.
              </p>

              {/* Select All Controls */}
              <div className={styles.SELECT_ALL_WRAPPER}>
                <span className={styles.SELECT_ALL_LABEL}>
                  {selectedIds.size} of {orphans.length} selected
                </span>
                <div className={styles.SELECT_ALL_BUTTONS}>
                  <button 
                    type="button"
                    onClick={handleSelectAll}
                    className={styles.SELECT_ALL_BUTTON}
                  >
                    Select all
                  </button>
                  <span className={styles.SELECT_ALL_LABEL}>|</span>
                  <button 
                    type="button"
                    onClick={handleDeselectAll}
                    className={styles.SELECT_ALL_BUTTON}
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              {/* Topics List */}
              <div className={styles.TOPICS_LIST_WRAPPER}>
                {orphans.map((topic) => {
                  const isSelected = selectedIds.has(topic.id);
                  
                  return (
                    <label 
                      key={topic.id}
                      className={styles.getTopicItemClass(isSelected)}
                    >
                      {/* Checkbox */}
                      <div className={styles.CHECKBOX_WRAPPER}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(topic.id)}
                          className={styles.CHECKBOX_INPUT}
                        />
                      </div>

                      {/* Topic Info */}
                      <div className={styles.TOPIC_INFO_WRAPPER}>
                        <p className={styles.TOPIC_NAME}>{topic.name}</p>
                        <div className={styles.TOPIC_META}>
                          <span className={styles.TOPIC_META_TEXT}>
                            {topic.connectionName || 'No connection'}
                          </span>
                          <span className={styles.TOPIC_META_SEPARATOR}>•</span>
                          <span className={styles.TOPIC_META_TEXT}>
                            {formatMessageCount(topic.messageCount)}
                          </span>
                        </div>
                      </div>

                      {/* Connection Status Badge */}
                      <div className={styles.CONNECTION_BADGE_WRAPPER}>
                        <span className={styles.getConnectionBadgeClass(topic.connectionStatus)}>
                          {getStatusIcon(topic.connectionStatus)}
                          {topic.connectionStatus || 'Unknown'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Warning */}
              <div className={styles.WARNING_BOX}>
                <AlertTriangle className={styles.WARNING_ICON} />
                <p className={styles.WARNING_TEXT}>
                  Deleting topics will also remove all associated messages. This action cannot be undone.
                </p>
              </div>

              {/* Summary */}
              {selectedIds.size > 0 && (
                <div className={styles.SUMMARY_BOX}>
                  <span className={styles.SUMMARY_LABEL}>Topics to delete</span>
                  <span className={styles.SUMMARY_VALUE}>{selectedIds.size}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.FOOTER_WRAPPER}>
          <Button variant="secondary" onClick={onClose}>
            {orphans.length === 0 ? 'Close' : 'Cancel'}
          </Button>
          {orphans.length > 0 && (
            <Button
              variant="danger"
              icon={Trash2}
              onClick={handleDelete}
              disabled={selectedIds.size === 0}
              isLoading={isDeleting}
            >
              Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}