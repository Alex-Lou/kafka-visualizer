import { useEffect, useState } from 'react';
import { MessageSquare, Search, Filter, Eye, EyeOff, RefreshCw, ChevronDown, ChevronRight, Trash2, Server, EyeIcon, XCircle, MoreVertical, Settings } from 'lucide-react';
import { Header, Card, Button, Badge } from '@components/common';
import { useTopicStore, useConnectionStore, useUIStore } from '@context/store';
import { topicApi } from '@services/api';
import { TOPICS } from '@constants/styles/topics';
import { LAYOUT } from '@constants/styles/layout';
import TopicDetailPanel from '@components/topics/TopicDetailPanel';

export default function TopicsPage() {
  const { topics, isLoading, fetchAllTopics, updateTopic } = useTopicStore();
  const { connections, fetchConnections } = useConnectionStore();
  const { wsConnected, addNotification } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonitored, setFilterMonitored] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [expandedConnections, setExpandedConnections] = useState(new Set());
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  
  // Detail panel state
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTopicConnection, setSelectedTopicConnection] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchConnections();
    fetchAllTopics();
  }, []);

  // Expand all connections by default when data loads
  useEffect(() => {
    if (connections.length > 0 && expandedConnections.size === 0) {
      const allConnectionIds = new Set(connections.map(c => c.id));
      setExpandedConnections(allConnectionIds);
    }
  }, [connections]);

  // Calculate stats
  const totalTopicsCount = topics.length;
  const activeTopicsCount = topics.filter(t => (t.messageCount || 0) > 0).length;
  const monitoredTopicsCount = topics.filter(t => t.monitored).length;
  const emptyNonMonitoredCount = topics.filter(t => (t.messageCount || 0) === 0 && !t.monitored).length;

  // Filter topics
  const getFilteredTopics = () => {
    return topics.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonitored = !filterMonitored || t.monitored;
      const matchesCluster = selectedCluster === 'all' || t.connectionId === Number(selectedCluster);
      const matchesEmpty = !hideEmpty || t.monitored || (t.messageCount || 0) > 0;
      return matchesSearch && matchesMonitored && matchesCluster && matchesEmpty;
    });
  };

  const filteredTopics = getFilteredTopics();

  // Group filtered topics by connection
  const topicsByConnection = connections.reduce((acc, connection) => {
    const connectionTopics = filteredTopics.filter(t => t.connectionId === connection.id);
    if (connectionTopics.length > 0 || selectedCluster === String(connection.id)) {
      acc[connection.id] = {
        connection,
        topics: connectionTopics
      };
    }
    return acc;
  }, {});

  const toggleMonitored = async (topic, e) => {
    e.stopPropagation();
    try {
      await updateTopic(topic.id, { ...topic, monitored: !topic.monitored });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleConnection = (connectionId) => {
    setExpandedConnections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId);
      } else {
        newSet.add(connectionId);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    await fetchConnections();
    await fetchAllTopics();
  };

  const handleTopicClick = (topic, connection) => {
    setSelectedTopic(topic);
    setSelectedTopicConnection(connection);
  };

  const handleClosePanel = () => {
    setSelectedTopic(null);
    setSelectedTopicConnection(null);
  };

  const handleTopicDelete = (topicId) => {
    // Remove from local state
    fetchAllTopics();
    addNotification({
      type: 'success',
      title: 'Topic Deleted',
      message: 'The topic has been removed'
    });
  };

  const handleCleanupOrphans = async () => {
    setCleanupLoading(true);
    try {
      const orphanTopics = topics.filter(t => (t.messageCount || 0) === 0 && !t.monitored);
      
      let deletedCount = 0;
      for (const topic of orphanTopics) {
        try {
          await topicApi.delete(topic.id);
          deletedCount++;
        } catch (e) {
          console.error('Failed to delete topic:', topic.name, e);
        }
      }
      
      await fetchAllTopics();
      
      addNotification({
        type: 'success',
        title: 'Cleanup Complete',
        message: `Removed ${deletedCount} empty topic${deletedCount !== 1 ? 's' : ''}`
      });
      
      setShowCleanupModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Cleanup Failed',
        message: error.message
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterMonitored(false);
    setHideEmpty(false);
    setSelectedCluster('all');
  };

  const hasActiveFilters = searchQuery || filterMonitored || hideEmpty || selectedCluster !== 'all';

  return (
    <>
      <Header
        title="Topics"
        subtitle={`${activeTopicsCount} active • ${monitoredTopicsCount} monitored • ${totalTopicsCount} total`}
        actions={
          <div className="flex items-center gap-3">
            {wsConnected && (
              <Badge variant="success" size="sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                Live
              </Badge>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Sync All
            </Button>
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        {/* Enhanced Filters Bar */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className={TOPICS.SEARCH_WRAPPER + ' flex-1 min-w-[200px]'}>
              <Search className={TOPICS.SEARCH_ICON} />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={TOPICS.SEARCH_INPUT}
              />
            </div>

            {/* Cluster Filter */}
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-surface-400" />
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Clusters</option>
                {connections.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.bootstrapServers})
                  </option>
                ))}
              </select>
            </div>

            {/* Monitored Filter */}
            <button
              onClick={() => setFilterMonitored(!filterMonitored)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterMonitored 
                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400' 
                  : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <EyeIcon className="w-4 h-4" />
              Monitored
            </button>

            {/* Hide Empty Filter */}
            <button
              onClick={() => setHideEmpty(!hideEmpty)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                hideEmpty 
                  ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400' 
                  : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Hide Empty
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <XCircle className="w-4 h-4" />
                Reset
              </button>
            )}

            {/* Cleanup Button */}
            {emptyNonMonitoredCount > 0 && (
              <button
                onClick={() => setShowCleanupModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-error-50 dark:bg-error-900/30 text-error-600 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-900/50 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Clean {emptyNonMonitoredCount}
              </button>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
              <span className="text-xs text-surface-500">Showing:</span>
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                {filteredTopics.length} of {totalTopicsCount} topics
              </span>
              {hideEmpty && emptyNonMonitoredCount > 0 && (
                <Badge variant="secondary" size="sm">
                  {emptyNonMonitoredCount} hidden
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Topics organized by connection */}
        <div className="space-y-4">
          {Object.entries(topicsByConnection).map(([connId, data]) => {
            const connectionId = Number(connId);
            const isExpanded = expandedConnections.has(connectionId);
            const { connection, topics: connectionTopics } = data;
            const activeCount = connectionTopics.filter(t => (t.messageCount || 0) > 0).length;

            return (
              <Card key={connectionId} className="overflow-hidden">
                {/* Connection Header */}
                <button
                  onClick={() => toggleConnection(connectionId)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-surface-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-surface-400" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {connection.bootstrapServers}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={connection.status === 'CONNECTED' ? 'success' : 'error'}>
                      {connection.status}
                    </Badge>
                    <Badge variant="secondary">
                      {activeCount} active / {connectionTopics.length}
                    </Badge>
                  </div>
                </button>

                {/* Topics Grid */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    {connectionTopics.length === 0 ? (
                      <div className="text-center py-8 text-surface-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No topics match your filters</p>
                        <button 
                          onClick={resetFilters}
                          className="text-primary-500 hover:text-primary-600 text-sm mt-2"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      <div className={TOPICS.TOPICS_GRID}>
                        {connectionTopics.map((topic) => {
                          const isEmpty = (topic.messageCount || 0) === 0;
                          const isActive = !isEmpty;
                          
                          return (
                            <div 
                              key={topic.id} 
                              onClick={() => handleTopicClick(topic, connection)}
                              className={`${TOPICS.TOPIC_CARD} cursor-pointer hover:shadow-lg hover:border-primary-500/50 transition-all ${isEmpty && !topic.monitored ? 'opacity-60' : ''}`}
                              style={{ position: 'relative' }}
                            >
                              <div 
                                className={TOPICS.TOPIC_CARD_COLOR_BAR} 
                                style={{ backgroundColor: topic.color || (isActive ? '#22c55e' : '#6b7280') }} 
                              />
                              <div className={TOPICS.TOPIC_CARD_HEADER}>
                                <div className={`${TOPICS.TOPIC_CARD_ICON} ${isActive ? 'bg-success-100 dark:bg-success-900/50 text-success-600' : TOPICS.TOPIC_CARD_ICON_BG}`}>
                                  <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className={TOPICS.TOPIC_CARD_CONTENT}>
                                  <h3 className={TOPICS.TOPIC_CARD_NAME}>{topic.name}</h3>
                                  {topic.lastMessageAt && (
                                    <p className="text-xs text-surface-500 dark:text-surface-400">
                                      Last: {new Date(topic.lastMessageAt).toLocaleTimeString()}
                                    </p>
                                  )}
                                </div>
                                {/* Quick action menu */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTopicClick(topic, connection);
                                  }}
                                  className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Settings className="w-4 h-4 text-surface-400" />
                                </button>
                              </div>
                              <div className={TOPICS.TOPIC_CARD_BODY}>
                                {topic.description && (
                                  <p className={TOPICS.TOPIC_CARD_DESCRIPTION + ' line-clamp-2'}>
                                    {topic.description}
                                  </p>
                                )}
                                <div className={TOPICS.TOPIC_CARD_STATS}>
                                  <div className={TOPICS.TOPIC_CARD_STAT}>
                                    <span>Messages:</span>
                                    <span className={`${TOPICS.TOPIC_CARD_STAT_VALUE} ${isActive ? 'text-success-600' : ''}`}>
                                      {topic.messageCount?.toLocaleString() || 0}
                                    </span>
                                  </div>
                                  <div className={TOPICS.TOPIC_CARD_STAT}>
                                    <span>Partitions:</span>
                                    <span className={TOPICS.TOPIC_CARD_STAT_VALUE}>{topic.partitions || '-'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className={TOPICS.TOPIC_CARD_FOOTER}>
                                <div className={TOPICS.TOPIC_CARD_BADGES}>
                                  {topic.monitored && <Badge variant="success" size="sm">Monitored</Badge>}
                                  {isActive && !topic.monitored && <Badge variant="accent" size="sm">Active</Badge>}
                                  {isEmpty && !topic.monitored && <Badge variant="neutral" size="sm">Empty</Badge>}
                                </div>
                                <div className={TOPICS.TOPIC_CARD_ACTIONS}>
                                  <button
                                    onClick={(e) => toggleMonitored(topic, e)}
                                    className={TOPICS.TOPIC_CARD_ACTION_BTN}
                                    title={topic.monitored ? 'Stop monitoring' : 'Start monitoring'}
                                  >
                                    {topic.monitored ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {Object.keys(topicsByConnection).length === 0 && !isLoading && (
          <div className={TOPICS.EMPTY_STATE}>
            <MessageSquare className={TOPICS.EMPTY_STATE_ICON} />
            <h3 className={TOPICS.EMPTY_STATE_TITLE}>No topics found</h3>
            <p className={TOPICS.EMPTY_STATE_TEXT}>
              {hasActiveFilters 
                ? 'No topics match your current filters' 
                : 'Create a connection and sync topics to get started'}
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={resetFilters} className="mt-4">
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* Cleanup Modal */}
        {showCleanupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/50 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-error-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                  Clean Empty Topics
                </h3>
              </div>
              
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                This will remove <strong>{emptyNonMonitoredCount} topics</strong> that have 0 messages and are not being monitored.
              </p>
              
              <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 mb-6">
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  <strong>Note:</strong> Monitored topics will be kept. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCleanupModal(false)}
                  disabled={cleanupLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCleanupOrphans}
                  isLoading={cleanupLoading}
                  className="bg-error-600 hover:bg-error-700 text-white"
                >
                  Delete {emptyNonMonitoredCount} Topics
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Topic Detail Panel */}
      {selectedTopic && (
        <TopicDetailPanel
          topic={selectedTopic}
          connection={selectedTopicConnection}
          onClose={handleClosePanel}
          onUpdate={() => fetchAllTopics()}
          onDelete={handleTopicDelete}
        />
      )}
    </>
  );
}