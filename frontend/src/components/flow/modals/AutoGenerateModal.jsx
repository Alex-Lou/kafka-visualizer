import { useState, useMemo } from 'react';
import { Server, MessageSquare, AlertTriangle, Wand2, CheckCircle, XCircle, Loader2, CircleOff } from 'lucide-react';
import { Button, Badge } from '@components/common';
import * as styles from '@constants/styles/autoGenerate';

// Helper pour mapper le statut
const getConnectionStatus = (connection) => {
  const status = connection?.status;
  switch (status) {
    case 'CONNECTED':
      return { variant: 'success', label: 'Connected', icon: CheckCircle };
    case 'ERROR':
      return { variant: 'danger', label: 'Error', icon: XCircle };
    case 'CONNECTING':
      return { variant: 'warning', label: 'Connecting', icon: Loader2 };
    default:
      return { variant: 'secondary', label: 'Unknown', icon: CircleOff };
  }
};

export default function AutoGenerateModal({ topics, connections, onConfirm, onCancel }) {
  // État pour gérer les connexions sélectionnées
  const [selectedConnectionIds, setSelectedConnectionIds] = useState(() => 
    new Set(connections.map(c => c.id))
  );

  // Topics monitorés
  const monitoredTopics = topics.filter(t => t.monitored);
  
  // Connexions sélectionnées
  const selectedConnections = useMemo(() => 
    connections.filter(c => selectedConnectionIds.has(c.id)),
    [connections, selectedConnectionIds]
  );

  // Topics pour les connexions sélectionnées
  const selectedMonitoredTopics = useMemo(() => 
    monitoredTopics.filter(t => selectedConnectionIds.has(t.connectionId)),
    [monitoredTopics, selectedConnectionIds]
  );

  // Compter les connexions par statut (parmi les sélectionnées)
  const connectedCount = selectedConnections.filter(c => c.status === 'CONNECTED').length;
  const errorCount = selectedConnections.filter(c => c.status === 'ERROR').length;
  const otherCount = selectedConnections.length - connectedCount - errorCount;

  // Handlers de sélection
  const handleToggleConnection = (connectionId) => {
    setSelectedConnectionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId);
      } else {
        newSet.add(connectionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedConnectionIds(new Set(connections.map(c => c.id)));
  };

  const handleDeselectAll = () => {
    setSelectedConnectionIds(new Set());
  };

  // Handler de confirmation avec les connexions sélectionnées
  const handleConfirm = () => {
    const selectedIds = Array.from(selectedConnectionIds);
    onConfirm(selectedIds);
  };

  return (
    <div className={styles.MODAL_OVERLAY}>
      <div className={styles.MODAL_CONTAINER}>
        {/* Header */}
        <div className={styles.HEADER_WRAPPER}>
          <div className={styles.HEADER_CONTENT}>
            <div className={styles.HEADER_ICON_WRAPPER}>
              <Wand2 className={styles.HEADER_ICON} />
            </div>
            <div>
              <h3 className={styles.HEADER_TITLE}>
                Auto-Generate Flow
              </h3>
              <p className={styles.HEADER_SUBTITLE}>From your connections & topics</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.BODY_WRAPPER}>
          <p className={styles.BODY_DESCRIPTION}>
            Select the connections to include in the flow:
          </p>

          <div className={styles.SECTION_WRAPPER}>
            {/* Connections Summary Card */}
            <div className={styles.SUMMARY_CARD}>
              <div className={styles.SUMMARY_CARD_HEADER}>
                <div className={styles.SUMMARY_CARD_LABEL_WRAPPER}>
                  <Server className={styles.SUMMARY_CARD_ICON_PRIMARY} />
                  <span className={styles.SUMMARY_CARD_LABEL}>Connections</span>
                </div>
                <Badge variant="primary">
                  {selectedConnections.length} / {connections.length}
                </Badge>
              </div>
              
              {/* Status Breakdown */}
              {selectedConnections.length > 0 && (
                <div className={styles.STATUS_BREAKDOWN_WRAPPER}>
                  {connectedCount > 0 && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className={styles.STATUS_ICON_SMALL} />
                      {connectedCount} connected
                    </Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="danger" size="sm">
                      <XCircle className={styles.STATUS_ICON_SMALL} />
                      {errorCount} error
                    </Badge>
                  )}
                  {otherCount > 0 && (
                    <Badge variant="secondary" size="sm">
                      <CircleOff className={styles.STATUS_ICON_SMALL} />
                      {otherCount} other
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Select All / Deselect All Controls */}
            {connections.length > 0 && (
              <div className={styles.SELECT_ALL_WRAPPER}>
                <span className={styles.SELECT_ALL_LABEL}>
                  {selectedConnectionIds.size} selected
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
            )}

            {/* Connections List with Checkboxes */}
            {connections.length > 0 && (
              <div className={styles.CONNECTIONS_LIST_WRAPPER}>
                {connections.map((connection) => {
                  const statusInfo = getConnectionStatus(connection);
                  const StatusIcon = statusInfo.icon;
                  const isSelected = selectedConnectionIds.has(connection.id);
                  const topicsForConnection = topics.filter(
                    t => t.connectionId === connection.id && t.monitored
                  ).length;
                  
                  return (
                    <label 
                      key={connection.id}
                      className={styles.getConnectionItemClass(isSelected)}
                    >
                      {/* Checkbox */}
                      <div className={styles.CHECKBOX_WRAPPER}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleConnection(connection.id)}
                          className={styles.CHECKBOX_INPUT}
                        />
                      </div>

                      {/* Connection Info */}
                      <div className={styles.CONNECTION_INFO_WRAPPER}>
                        <StatusIcon className={styles.getStatusIconClass(statusInfo.variant)} />
                        <span className={styles.CONNECTION_NAME}>
                          {connection.name}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className={styles.CONNECTION_META_WRAPPER}>
                        {topicsForConnection > 0 && (
                          <span className={styles.CONNECTION_TOPICS_COUNT}>
                            {topicsForConnection} topic{topicsForConnection > 1 ? 's' : ''}
                          </span>
                        )}
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Monitored Topics Card */}
            <div className={styles.TOPICS_CARD}>
              <div className={styles.TOPICS_LABEL_WRAPPER}>
                <MessageSquare className={styles.SUMMARY_CARD_ICON_ACCENT} />
                <span className={styles.TOPICS_LABEL}>Monitored Topics</span>
              </div>
              <Badge variant="accent">
                {selectedMonitoredTopics.length} / {monitoredTopics.length}
              </Badge>
            </div>
          </div>

          {/* Alerts */}
          {connections.length === 0 && (
            <div className={styles.ALERT_DANGER}>
              <AlertTriangle className={styles.ALERT_ICON_DANGER} />
              <p className={styles.ALERT_TEXT_DANGER}>
                No connections found. Create a connection first.
              </p>
            </div>
          )}

          {selectedConnections.length === 0 && connections.length > 0 && (
            <div className={styles.ALERT_WARNING}>
              <AlertTriangle className={styles.ALERT_ICON_WARNING} />
              <p className={styles.ALERT_TEXT_WARNING}>
                Select at least one connection to generate the flow.
              </p>
            </div>
          )}

          {errorCount > 0 && (
            <div className={styles.ALERT_WARNING}>
              <AlertTriangle className={styles.ALERT_ICON_WARNING} />
              <p className={styles.ALERT_TEXT_WARNING}>
                {errorCount} connection{errorCount > 1 ? 's' : ''} in error state will appear in red.
              </p>
            </div>
          )}

          {selectedMonitoredTopics.length === 0 && selectedConnections.length > 0 && (
            <div className={styles.ALERT_INFO}>
              <AlertTriangle className={styles.ALERT_ICON_INFO} />
              <p className={styles.ALERT_TEXT_INFO}>
                No monitored topics for selected connections. Only cluster nodes will be generated.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.FOOTER_WRAPPER}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Wand2}
            onClick={handleConfirm}
            disabled={selectedConnections.length === 0}
          >
            Generate ({selectedConnections.length})
          </Button>
        </div>
      </div>
    </div>
  );
}