import { useEffect, useState } from 'react';
import { MessageSquare, Search, Filter, Eye, EyeOff, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { Header, Card, Button, Badge } from '@components/common';
import { useTopicStore, useConnectionStore } from '@context/store';
import { TOPICS, TOPIC_COLORS } from '@constants/styles/topics';
import { LAYOUT } from '@constants/styles/layout';
import wsService from '@services/websocket';

export default function TopicsPage() {
  const { topics, isLoading, fetchTopics, updateTopic, updateTopicCount } = useTopicStore();
  const { connections, fetchConnections } = useConnectionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonitored, setFilterMonitored] = useState(false);
  const [expandedConnections, setExpandedConnections] = useState(new Set());
  const [wsConnected, setWsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Initializing WebSocket connection...');

    const connectWS = async () => {
      try {
        await wsService.connect();
        console.log('WebSocket connected successfully');
        setWsConnected(true);

        // Subscribe to topic updates
        wsService.subscribe('/topic/topics', (message) => {
          console.log('Topic update received:', message);
          if (message.type === 'TOPIC_UPDATE' && message.payload) {
            const { topicId, topicName, messageCount } = message.payload;
            updateTopicCount(topicId, messageCount);
          }
        });

        // Subscribe to new messages (to update counts in real-time)
        wsService.subscribe('/topic/messages', (message) => {
          console.log('New message received:', message);
          if (message.type === 'NEW_MESSAGE' && message.payload) {
            // Find the topic and increment its message count
            const msg = message.payload;
            const topic = topics.find(t => t.name === msg.topicName);
            if (topic) {
              updateTopicCount(topic.id, (topic.messageCount || 0) + 1);
            }
          }
        });

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
      }
    };

    connectWS();

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting WebSocket...');
      wsService.disconnect();
    };
  }, []);

  // Fetch connections and topics on mount
  useEffect(() => {
    fetchConnections();
  }, []);

  // Expand all connections by default when data loads
  useEffect(() => {
    if (connections.length > 0 && expandedConnections.size === 0) {
      const allConnectionIds = new Set(connections.map(c => c.id));
      setExpandedConnections(allConnectionIds);
    }
  }, [connections]);

  // Group topics by connection
  const topicsByConnection = connections.reduce((acc, connection) => {
    const connectionTopics = topics.filter(t => t.connectionId === connection.id);
    if (connectionTopics.length > 0) {
      acc[connection.id] = {
        connection,
        topics: connectionTopics
      };
    }
    return acc;
  }, {});

  const filteredTopicsByConnection = Object.entries(topicsByConnection).reduce((acc, [connId, data]) => {
    const filtered = data.topics.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !filterMonitored || t.monitored;
      return matchesSearch && matchesFilter;
    });

    if (filtered.length > 0) {
      acc[connId] = { ...data, topics: filtered };
    }
    return acc;
  }, {});

  const toggleMonitored = async (topic) => {
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

  const syncAllTopics = async () => {
    for (const connection of connections) {
      await fetchTopics(connection.id);
    }
  };

  const totalTopics = Object.values(filteredTopicsByConnection).reduce((sum, data) => sum + data.topics.length, 0);

  return (
    <>
      <Header
        title="Topics"
        subtitle={`${connections.length} connection${connections.length !== 1 ? 's' : ''} • ${totalTopics} topic${totalTopics !== 1 ? 's' : ''}`}
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
              onClick={syncAllTopics}
              isLoading={isLoading}
            >
              Sync All
            </Button>
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        {/* Filters */}
        <div className={TOPICS.FILTERS_CONTAINER}>
          <div className={TOPICS.SEARCH_WRAPPER}>
            <Search className={TOPICS.SEARCH_ICON} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={TOPICS.SEARCH_INPUT}
            />
          </div>
          <button
            onClick={() => setFilterMonitored(!filterMonitored)}
            className={`${TOPICS.FILTER_BTN} ${filterMonitored ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : ''}`}
          >
            <Filter className="w-4 h-4" />
            {filterMonitored ? 'Monitored' : 'All'}
          </button>
        </div>

        {/* Topics organized by connection (accordion) */}
        <div className="space-y-4">
          {Object.entries(filteredTopicsByConnection).map(([connId, data]) => {
            const connectionId = Number(connId);
            const isExpanded = expandedConnections.has(connectionId);
            const { connection, topics: connectionTopics } = data;

            return (
              <Card key={connectionId} className="overflow-hidden">
                {/* Connection Header (clickable to expand/collapse) */}
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
                  <div className="flex items-center gap-4">
                    <Badge variant={connection.status === 'CONNECTED' ? 'success' : 'error'}>
                      {connection.status}
                    </Badge>
                    <Badge variant="secondary">
                      {connectionTopics.length} topic{connectionTopics.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </button>

                {/* Topics Grid (collapsible) */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className={TOPICS.TOPICS_GRID}>
                      {connectionTopics.map((topic) => (
                        <div key={topic.id} className={TOPICS.TOPIC_CARD} style={{ position: 'relative' }}>
                          <div className={TOPICS.TOPIC_CARD_COLOR_BAR} style={{ backgroundColor: topic.color || '#3B82F6' }} />
                          <div className={TOPICS.TOPIC_CARD_HEADER}>
                            <div className={`${TOPICS.TOPIC_CARD_ICON} ${TOPICS.TOPIC_CARD_ICON_BG}`}>
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
                          </div>
                          <div className={TOPICS.TOPIC_CARD_BODY}>
                            {topic.description && <p className={TOPICS.TOPIC_CARD_DESCRIPTION}>{topic.description}</p>}
                            <div className={TOPICS.TOPIC_CARD_STATS}>
                              <div className={TOPICS.TOPIC_CARD_STAT}>
                                <span>Messages:</span>
                                <span className={TOPICS.TOPIC_CARD_STAT_VALUE}>
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
                            </div>
                            <div className={TOPICS.TOPIC_CARD_ACTIONS}>
                              <button
                                onClick={() => toggleMonitored(topic)}
                                className={TOPICS.TOPIC_CARD_ACTION_BTN}
                                title={topic.monitored ? 'Stop monitoring' : 'Start monitoring'}
                              >
                                {topic.monitored ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {totalTopics === 0 && !isLoading && (
          <div className={TOPICS.EMPTY_STATE}>
            <MessageSquare className={TOPICS.EMPTY_STATE_ICON} />
            <h3 className={TOPICS.EMPTY_STATE_TITLE}>No topics found</h3>
            <p className={TOPICS.EMPTY_STATE_TEXT}>
              {searchQuery ? 'Try a different search term' : 'Create a connection and sync topics to get started'}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
