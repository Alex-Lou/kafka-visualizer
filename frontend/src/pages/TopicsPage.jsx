import { useEffect, useState } from 'react';
import { MessageSquare, Search, Filter, Eye, EyeOff, RefreshCw, ChevronDown, ChevronRight, Trash2, Server, XCircle, Settings } from 'lucide-react';
import { Header, Card, Button, Badge } from '@components/common';
import { useTopicStore, useConnectionStore, useUIStore } from '@context/store/index';
import { topicApi } from '@services/api';
import { TOPICS as STYLES } from '@constants/styles/topics';
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
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTopicConnection, setSelectedTopicConnection] = useState(null);

  useEffect(() => {
    fetchConnections();
    fetchAllTopics();
  }, []);

  useEffect(() => {
    if (connections.length > 0 && expandedConnections.size === 0) {
      setExpandedConnections(new Set(connections.map(c => c.id)));
    }
  }, [connections]);

  const totalTopicsCount = topics.length;
  const activeTopicsCount = topics.filter(t => (t.messageCount || 0) > 0).length;
  const monitoredTopicsCount = topics.filter(t => t.monitored).length;
  const emptyNonMonitoredCount = topics.filter(t => (t.messageCount || 0) === 0 && !t.monitored).length;

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!filterMonitored || t.monitored) &&
    (selectedCluster === 'all' || t.connectionId === Number(selectedCluster)) &&
    (!hideEmpty || t.monitored || (t.messageCount || 0) > 0)
  );

  const topicsByConnection = connections.reduce((acc, conn) => {
    const connTopics = filteredTopics.filter(t => t.connectionId === conn.id);
    if (connTopics.length > 0 || selectedCluster === String(conn.id)) {
      acc[conn.id] = { connection: conn, topics: connTopics };
    }
    return acc;
  }, {});

  const toggleMonitored = async (topic, e) => {
    e.stopPropagation();
    await updateTopic(topic.id, { ...topic, monitored: !topic.monitored });
  };

  const toggleConnection = (id) => setExpandedConnections(p => {
    const newSet = new Set(p);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    return newSet;
  });

  const handleRefresh = () => {
    fetchAllTopics();
    fetchConnections();
  };

  const handleTopicClick = (topic, connection) => {
    setSelectedTopic(topic);
    setSelectedTopicConnection(connection);
  };

  const handleClosePanel = () => {
    setSelectedTopic(null);
    setSelectedTopicConnection(null);
  };

  const handleTopicDelete = () => {
    fetchAllTopics();
    addNotification({ type: 'success', title: 'Topic Deleted' });
  };

  const handleCleanupOrphans = async () => {
    setCleanupLoading(true);
    const orphanTopics = topics.filter(t => (t.messageCount || 0) === 0 && !t.monitored);
    let deletedCount = 0;
    for (const topic of orphanTopics) {
      try {
        await topicApi.delete(topic.id);
        deletedCount++;
      } catch (e) { console.error('Failed to delete topic:', topic.name, e); }
    }
    await fetchAllTopics();
    addNotification({ type: 'success', title: 'Cleanup Complete', message: `Removed ${deletedCount} empty topics` });
    setShowCleanupModal(false);
    setCleanupLoading(false);
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
            {wsConnected && <Badge variant="success" size="sm"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>Live</Badge>}
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRefresh} isLoading={isLoading}>Sync All</Button>
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={STYLES.FILTERS_BAR}>
          <div className={STYLES.FILTERS_GRID}>
            <div className={`${STYLES.SEARCH_WRAPPER} flex-1 min-w-[200px]`}>
              <Search className={STYLES.SEARCH_ICON} />
              <input type="text" placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={STYLES.SEARCH_INPUT} />
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              <select value={selectedCluster} onChange={(e) => setSelectedCluster(e.target.value)} className={STYLES.FILTER_SELECT}>
                <option value="all">All Clusters</option>
                {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => setFilterMonitored(!filterMonitored)} className={`${STYLES.FILTER_BUTTON} ${filterMonitored ? STYLES.FILTER_BUTTON_ACTIVE : STYLES.FILTER_BUTTON_INACTIVE}`}>
              <Eye className="w-4 h-4" /> Monitored
            </button>
            <button onClick={() => setHideEmpty(!hideEmpty)} className={`${STYLES.FILTER_BUTTON} ${hideEmpty ? STYLES.FILTER_BUTTON_ACTIVE : STYLES.FILTER_BUTTON_INACTIVE}`}>
              <Filter className="w-4 h-4" /> Hide Empty
            </button>
            {hasActiveFilters && <button onClick={resetFilters} className={STYLES.RESET_BUTTON}><XCircle className="w-4 h-4" /> Reset</button>}
            {emptyNonMonitoredCount > 0 && <button onClick={() => setShowCleanupModal(true)} className={STYLES.CLEANUP_BUTTON}><Trash2 className="w-4 h-4" /> Clean {emptyNonMonitoredCount}</button>}
          </div>
          {hasActiveFilters && (
            <div className={STYLES.ACTIVE_FILTERS_BAR}>
              <span className={STYLES.ACTIVE_FILTERS_LABEL}>Showing:</span>
              <span className={STYLES.ACTIVE_FILTERS_VALUE}>{filteredTopics.length} of {totalTopicsCount} topics</span>
              {hideEmpty && emptyNonMonitoredCount > 0 && <Badge variant="secondary" size="sm">{emptyNonMonitoredCount} hidden</Badge>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(topicsByConnection).map(([connId, data]) => {
            const { connection, topics: connTopics } = data;
            const isExpanded = expandedConnections.has(Number(connId));
            const activeCount = connTopics.filter(t => (t.messageCount || 0) > 0).length;
            return (
              <Card key={connId} className={STYLES.CONNECTION_CARD}>
                <button onClick={() => toggleConnection(Number(connId))} className={STYLES.CONNECTION_HEADER}>
                  <div className={STYLES.CONNECTION_HEADER_LEFT}>
                    {isExpanded ? <ChevronDown className={STYLES.CONNECTION_CHEVRON} /> : <ChevronRight className={STYLES.CONNECTION_CHEVRON} />}
                    <div className="text-left">
                      <h3 className={STYLES.CONNECTION_TITLE}>{connection.name}</h3>
                      <p className={STYLES.CONNECTION_SUBTITLE}>{connection.bootstrapServers}</p>
                    </div>
                  </div>
                  <div className={STYLES.CONNECTION_BADGES}>
                    <Badge variant={connection.status === 'CONNECTED' ? 'success' : 'error'}>{connection.status}</Badge>
                    <Badge variant="secondary">{activeCount} active / {connTopics.length}</Badge>
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-6">
                    {connTopics.length === 0 ? (
                      <div className={STYLES.EMPTY_STATE}><MessageSquare className={STYLES.EMPTY_STATE_ICON} /><h3 className={STYLES.EMPTY_STATE_TITLE}>No topics match</h3><p className={STYLES.EMPTY_STATE_TEXT}>Try adjusting your filters.</p></div>
                    ) : (
                      <div className={STYLES.TOPICS_GRID}>
                        {connTopics.map((topic) => {
                          const isEmpty = (topic.messageCount || 0) === 0;
                          return (
                            <div key={topic.id} onClick={() => handleTopicClick(topic, connection)} className={`${STYLES.TOPIC_CARD} ${isEmpty && !topic.monitored ? 'opacity-60' : ''}`}>
                              <div className={STYLES.TOPIC_CARD_COLOR_BAR} style={{ backgroundColor: topic.color || (isEmpty ? '#6b7280' : '#22c55e') }} />
                              <div className={STYLES.TOPIC_CARD_HEADER}>
                                <div className={`${STYLES.TOPIC_CARD_ICON} ${!isEmpty ? 'bg-success-100 dark:bg-success-900/50 text-success-600' : STYLES.TOPIC_CARD_ICON_BG}`}><MessageSquare className="w-5 h-5" /></div>
                                <div className={STYLES.TOPIC_CARD_CONTENT}>
                                  <h3 className={STYLES.TOPIC_CARD_NAME}>{topic.name}</h3>
                                  {topic.lastMessageAt && <p className={STYLES.TOPIC_CARD_TIME}>Last: {new Date(topic.lastMessageAt).toLocaleTimeString()}</p>}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleTopicClick(topic, connection); }} className={STYLES.TOPIC_CARD_MENU_BTN}><Settings className="w-4 h-4 text-muted-foreground" /></button>
                              </div>
                              <div className={STYLES.TOPIC_CARD_BODY}>
                                {topic.description && <p className={`${STYLES.TOPIC_CARD_DESCRIPTION} line-clamp-2`}>{topic.description}</p>}
                                <div className={STYLES.TOPIC_CARD_STATS}>
                                  <div className={STYLES.TOPIC_CARD_STAT}><span>Messages:</span><span className={`${STYLES.TOPIC_CARD_STAT_VALUE} ${!isEmpty ? 'text-success-600' : ''}`}>{topic.messageCount?.toLocaleString() || 0}</span></div>
                                  <div className={STYLES.TOPIC_CARD_STAT}><span>Partitions:</span><span className={STYLES.TOPIC_CARD_STAT_VALUE}>{topic.partitions || '-'}</span></div>
                                </div>
                              </div>
                              <div className={STYLES.TOPIC_CARD_FOOTER}>
                                <div className={STYLES.TOPIC_CARD_BADGES}>
                                  {topic.monitored && <Badge variant="success" size="sm">Monitored</Badge>}
                                  {!isEmpty && !topic.monitored && <Badge variant="accent" size="sm">Active</Badge>}
                                  {isEmpty && !topic.monitored && <Badge variant="neutral" size="sm">Empty</Badge>}
                                </div>
                                <div className={STYLES.TOPIC_CARD_ACTIONS}>
                                  <button onClick={(e) => toggleMonitored(topic, e)} className={STYLES.TOPIC_CARD_ACTION_BTN} title={topic.monitored ? 'Stop monitoring' : 'Start monitoring'}>
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

        {Object.keys(topicsByConnection).length === 0 && !isLoading && (
          <div className={STYLES.EMPTY_STATE}>
            <MessageSquare className={STYLES.EMPTY_STATE_ICON} />
            <h3 className={STYLES.EMPTY_STATE_TITLE}>No topics found</h3>
            <p className={STYLES.EMPTY_STATE_TEXT}>{hasActiveFilters ? 'No topics match your current filters' : 'Create a connection and sync topics to get started'}</p>
            {hasActiveFilters && <Button variant="secondary" size="sm" onClick={resetFilters} className="mt-4">Reset Filters</Button>}
          </div>
        )}

        {showCleanupModal && (
          <div className={STYLES.MODAL_BACKDROP}>
            <div className={STYLES.MODAL_CONTENT}>
              <div className={STYLES.MODAL_HEADER}>
                <div className={STYLES.MODAL_ICON_WRAPPER}><Trash2 className={STYLES.MODAL_ICON} /></div>
                <h3 className={STYLES.MODAL_TITLE}>Clean Empty Topics</h3>
              </div>
              <p className={STYLES.MODAL_TEXT}>This will remove <strong>{emptyNonMonitoredCount} topics</strong> that have 0 messages and are not being monitored.</p>
              <div className={STYLES.MODAL_NOTE}><p><strong>Note:</strong> Monitored topics will be kept. This action cannot be undone.</p></div>
              <div className={STYLES.MODAL_ACTIONS}>
                <Button variant="secondary" onClick={() => setShowCleanupModal(false)} disabled={cleanupLoading}>Cancel</Button>
                <Button onClick={handleCleanupOrphans} isLoading={cleanupLoading} className={STYLES.MODAL_DELETE_BTN}>Delete {emptyNonMonitoredCount} Topics</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedTopic && <TopicDetailPanel topic={selectedTopic} connection={selectedTopicConnection} onClose={handleClosePanel} onUpdate={fetchAllTopics} onDelete={handleTopicDelete} />}
    </>
  );
}
