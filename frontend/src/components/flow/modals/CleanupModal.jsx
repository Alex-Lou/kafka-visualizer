import { useState, useEffect } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Unplug, 
  Server, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Button } from '@components/common';
import { cleanupApi } from '@services/api';
import * as styles from '@constants/styles/flow/cleanupModal';

export function CleanupModal({ onClose, onDeleted }) {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  // Data
  const [orphanConnections, setOrphanConnections] = useState([]);
  const [orphanTopics, setOrphanTopics] = useState([]);
  
  // Selection
  const [selectedConnectionIds, setSelectedConnectionIds] = useState(new Set());
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());

  // ═══════════════════════════════════════════════════════════════════════
  // LOAD DATA
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    loadCleanupData();
  }, []);

  const loadCleanupData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cleanupApi.getOverview();
      const data = response.data || response || {};
      
      setOrphanConnections(data.orphanConnections || []);
      setOrphanTopics(data.orphanTopics || []);
    } catch (err) {
      setError(err.message || 'Failed to load cleanup data');
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SELECTION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  const toggleConnection = (id) => {
    setSelectedConnectionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleTopic = (id) => {
    setSelectedTopicIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllConnections = () => {
    setSelectedConnectionIds(new Set(orphanConnections.map(c => c.id)));
  };

  const deselectAllConnections = () => {
    setSelectedConnectionIds(new Set());
  };

  const selectAllTopics = () => {
    setSelectedTopicIds(new Set(orphanTopics.map(t => t.id)));
  };

  const deselectAllTopics = () => {
    setSelectedTopicIds(new Set());
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DELETE HANDLER
  // ═══════════════════════════════════════════════════════════════════════

  const handleDelete = async () => {
    const totalSelected = selectedConnectionIds.size + selectedTopicIds.size;
    if (totalSelected === 0) return;

    const confirmMessage = `Are you sure you want to delete ${totalSelected} element(s)? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const result = await cleanupApi.deleteSelected(
        Array.from(selectedConnectionIds),
        Array.from(selectedTopicIds)
      );
      
      const data = result.data || result;
      const deletedCount = (data.connectionsDeleted || 0) + (data.topicsDeleted || 0);
      
      // Callback pour notifier le parent
      onDeleted?.(deletedCount, data);
      
      // Recharger les données
      await loadCleanupData();
      setSelectedConnectionIds(new Set());
      setSelectedTopicIds(new Set());
    } catch (err) {
      setError(err.message || 'Failed to delete elements');
    } finally {
      setIsDeleting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  const formatMessageCount = (count) => {
    if (!count || count === 0) return '0 msgs';
    if (count < 1000) return `${count} msgs`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K msgs`;
    return `${(count / 1000000).toFixed(1)}M msgs`;
  };

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

  const totalSelected = selectedConnectionIds.size + selectedTopicIds.size;
  const hasOrphans = orphanConnections.length > 0 || orphanTopics.length > 0;

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className={styles.MODAL_OVERLAY}>
      <div className={styles.MODAL_CONTAINER}>
        
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className={styles.HEADER_WRAPPER}>
          <div className={styles.HEADER_CONTENT}>
            <div className={styles.HEADER_ICON_WRAPPER}>
              <Sparkles className={styles.HEADER_ICON} />
            </div>
            <div>
              <h3 className={styles.HEADER_TITLE}>Cleanup Manager</h3>
              <p className={styles.HEADER_SUBTITLE}>Remove orphan connections and topics</p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* BODY */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className={styles.BODY_WRAPPER}>
          
          {/* Loading State */}
          {isLoading && (
            <div className={styles.LOADING_WRAPPER}>
              <Loader2 className={styles.LOADING_SPINNER} />
              <span className={styles.LOADING_TEXT}>Scanning for orphan elements...</span>
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
          {!isLoading && !error && !hasOrphans && (
            <div className={styles.EMPTY_WRAPPER}>
              <div className={styles.EMPTY_ICON_WRAPPER}>
                <CheckCircle className={styles.EMPTY_ICON} />
              </div>
              <h4 className={styles.EMPTY_TITLE}>All clean!</h4>
              <p className={styles.EMPTY_SUBTITLE}>
                No orphan connections or topics found. Your system is healthy.
              </p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && hasOrphans && (
            <>
              {/* ══════════════════════════════════════════════════════════ */}
              {/* ORPHAN CONNECTIONS SECTION */}
              {/* ══════════════════════════════════════════════════════════ */}
              {orphanConnections.length > 0 && (
                <div className={styles.SECTION_WRAPPER}>
                  <div className={styles.SECTION_HEADER}>
                    <div className={styles.SECTION_TITLE_WRAPPER}>
                      <Server className={styles.SECTION_ICON_CONNECTION} />
                      <span className={styles.SECTION_TITLE}>Orphan Connections</span>
                      <span className={styles.SECTION_COUNT}>({orphanConnections.length})</span>
                    </div>
                    <div className={styles.SELECT_ALL_WRAPPER}>
                      <button onClick={selectAllConnections} className={styles.SELECT_ALL_BUTTON}>
                        Select all
                      </button>
                      <span className={styles.SELECT_ALL_SEPARATOR}>|</span>
                      <button onClick={deselectAllConnections} className={styles.SELECT_ALL_BUTTON}>
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className={styles.LIST_WRAPPER}>
                    {orphanConnections.map((connection) => {
                      const isSelected = selectedConnectionIds.has(connection.id);
                      return (
                        <label 
                          key={connection.id}
                          className={styles.getListItemClass(isSelected)}
                        >
                          <div className={styles.CHECKBOX_WRAPPER}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleConnection(connection.id)}
                              className={styles.CHECKBOX_INPUT}
                            />
                          </div>
                          <div className={styles.ITEM_INFO_WRAPPER}>
                            <p className={styles.ITEM_NAME}>{connection.name}</p>
                            <div className={styles.ITEM_META}>
                              <span className={styles.ITEM_META_TEXT}>
                                {connection.bootstrapServers}
                              </span>
                              <span className={styles.ITEM_META_SEPARATOR}>•</span>
                              <span className={styles.ITEM_META_TEXT}>
                                {connection.topicCount} topic{connection.topicCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <span className={styles.getStatusBadgeClass(connection.status)}>
                            {getStatusIcon(connection.status)}
                            {connection.status}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════ */}
              {/* ORPHAN TOPICS SECTION */}
              {/* ══════════════════════════════════════════════════════════ */}
              {orphanTopics.length > 0 && (
                <div className={styles.SECTION_WRAPPER}>
                  <div className={styles.SECTION_HEADER}>
                    <div className={styles.SECTION_TITLE_WRAPPER}>
                      <MessageSquare className={styles.SECTION_ICON_TOPIC} />
                      <span className={styles.SECTION_TITLE}>Orphan Topics</span>
                      <span className={styles.SECTION_COUNT}>({orphanTopics.length})</span>
                    </div>
                    <div className={styles.SELECT_ALL_WRAPPER}>
                      <button onClick={selectAllTopics} className={styles.SELECT_ALL_BUTTON}>
                        Select all
                      </button>
                      <span className={styles.SELECT_ALL_SEPARATOR}>|</span>
                      <button onClick={deselectAllTopics} className={styles.SELECT_ALL_BUTTON}>
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className={styles.LIST_WRAPPER}>
                    {orphanTopics.map((topic) => {
                      const isSelected = selectedTopicIds.has(topic.id);
                      return (
                        <label 
                          key={topic.id}
                          className={styles.getListItemClass(isSelected)}
                        >
                          <div className={styles.CHECKBOX_WRAPPER}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTopic(topic.id)}
                              className={styles.CHECKBOX_INPUT}
                            />
                          </div>
                          <div className={styles.ITEM_INFO_WRAPPER}>
                            <p className={styles.ITEM_NAME}>{topic.name}</p>
                            <div className={styles.ITEM_META}>
                              <span className={styles.ITEM_META_TEXT}>
                                {topic.connectionName || 'No connection'}
                              </span>
                              <span className={styles.ITEM_META_SEPARATOR}>•</span>
                              <span className={styles.ITEM_META_TEXT}>
                                {formatMessageCount(topic.messageCount)}
                              </span>
                            </div>
                          </div>
                          <span className={styles.getStatusBadgeClass(topic.connectionStatus)}>
                            {getStatusIcon(topic.connectionStatus)}
                            {topic.connectionStatus || 'Unknown'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════ */}
              {/* WARNING */}
              {/* ══════════════════════════════════════════════════════════ */}
              <div className={styles.WARNING_BOX}>
                <AlertTriangle className={styles.WARNING_ICON} />
                <p className={styles.WARNING_TEXT}>
                  Deleting connections will also remove all associated topics and messages. 
                  This action cannot be undone.
                </p>
              </div>

              {/* ══════════════════════════════════════════════════════════ */}
              {/* SUMMARY */}
              {/* ══════════════════════════════════════════════════════════ */}
              {totalSelected > 0 && (
                <div className={styles.SUMMARY_BOX}>
                  <span className={styles.SUMMARY_LABEL}>Selected for deletion</span>
                  <span className={styles.SUMMARY_VALUE}>
                    {selectedConnectionIds.size > 0 && `${selectedConnectionIds.size} connection${selectedConnectionIds.size > 1 ? 's' : ''}`}
                    {selectedConnectionIds.size > 0 && selectedTopicIds.size > 0 && ', '}
                    {selectedTopicIds.size > 0 && `${selectedTopicIds.size} topic${selectedTopicIds.size > 1 ? 's' : ''}`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className={styles.FOOTER_WRAPPER}>
          <Button variant="secondary" onClick={onClose}>
            {hasOrphans ? 'Cancel' : 'Close'}
          </Button>
          {hasOrphans && (
            <Button
              variant="danger"
              icon={Trash2}
              onClick={handleDelete}
              disabled={totalSelected === 0}
              isLoading={isDeleting}
            >
              Delete {totalSelected > 0 ? `(${totalSelected})` : ''}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}