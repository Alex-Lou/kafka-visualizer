import { useEffect, useState, useCallback, useRef } from 'react';
import { FileText, Search, Copy, Check, Clock, Hash, Radio, Filter, Download, FileJson, Archive, Database, Star, AlertCircle, PlayCircle, HardDrive, Calendar, Mail, X, Trash2, ChevronDown } from 'lucide-react';
import { Header, Card, Badge, Button } from '@components/common';
import { useMessageStore, useTopicStore, useRetentionStore } from '@context/store';
import { MESSAGES } from '@constants/styles/messages';
import { LAYOUT } from '@constants/styles/layout';
import { INPUTS } from '@constants/styles/components';
import wsService from '@services/websocket';

// JSON Syntax Highlighter Component (unchanged)
function JsonViewer({ data, className = '' }) {
  const highlightJson = (obj, indent = 0) => {
    if (obj === null) {
      return <span className={MESSAGES.JSON_NULL}>null</span>;
    }
    
    if (typeof obj === 'boolean') {
      return <span className={MESSAGES.JSON_BOOLEAN}>{obj.toString()}</span>;
    }
    
    if (typeof obj === 'number') {
      return <span className={MESSAGES.JSON_NUMBER}>{obj}</span>;
    }
    
    if (typeof obj === 'string') {
      return <span className={MESSAGES.JSON_STRING}>"{obj}"</span>;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return <span className={MESSAGES.JSON_BRACKET}>[]</span>;
      }
      
      return (
        <>
          <span className={MESSAGES.JSON_BRACKET}>[</span>
          {'\n'}
          {obj.map((item, i) => (
            <span key={i}>
              {'  '.repeat(indent + 1)}
              {highlightJson(item, indent + 1)}
              {i < obj.length - 1 && ','}
              {'\n'}
            </span>
          ))}
          {'  '.repeat(indent)}
          <span className={MESSAGES.JSON_BRACKET}>]</span>
        </>
      );
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return <span className={MESSAGES.JSON_BRACKET}>{'{}'}</span>;
      }
      
      return (
        <>
          <span className={MESSAGES.JSON_BRACKET}>{'{'}</span>
          {'\n'}
          {keys.map((key, i) => (
            <span key={key}>
              {'  '.repeat(indent + 1)}
              <span className={MESSAGES.JSON_KEY}>"{key}"</span>
              <span className={MESSAGES.JSON_BRACKET}>: </span>
              {highlightJson(obj[key], indent + 1)}
              {i < keys.length - 1 && ','}
              {'\n'}
            </span>
          ))}
          {'  '.repeat(indent)}
          <span className={MESSAGES.JSON_BRACKET}>{'}'}</span>
        </>
      );
    }
    
    return String(obj);
  };

  const parseAndHighlight = (str) => {
    try {
      const parsed = JSON.parse(str);
      return highlightJson(parsed);
    } catch {
      return <span className={MESSAGES.JSON_PLAIN}>{str}</span>;
    }
  };

  const viewerClass = `${MESSAGES.JSON_VIEWER} ${className}`;

  return (
    <pre className={viewerClass}>
      {typeof data === 'string' ? parseAndHighlight(data) : highlightJson(data)}
    </pre>
  );
}

// Export utilities (unchanged)
const exportToJson = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename + '.json');
};

const exportToCsv = (messages, filename) => {
  const headers = ['id', 'key', 'value', 'topicName', 'partition', 'offset', 'timestamp', 'direction', 'status'];
  const csvRows = [headers.join(',')];
  
  messages.forEach(msg => {
    const row = headers.map(header => {
      let value = msg[header] ?? '';
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = '"' + value + '"';
        }
      }
      return value;
    });
    csvRows.push(row.join(','));
  });
  
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename + '.csv');
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function MessagesPage() {
  const { 
    messages, selectedMessage, isLoading, stats, filters,
    fetchFilteredMessages, selectMessage, addMessage, setFilters, 
    bookmarkMessage, fetchQuickStats
  } = useMessageStore();
  
  const { topics, selectedTopic, selectTopic } = useTopicStore();
  const { archiveTopic } = useRetentionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newMessageHighlight, setNewMessageHighlight] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWS = async () => {
      try {
        await wsService.connect();
        setWsConnected(true);

        wsService.subscribe('/topic/messages', (message) => {
          if (message.type === 'NEW_MESSAGE' && message.payload) {
            const newMsg = message.payload;
            
            // Only add if we're in HOT mode and correct topic
            if (filters.source === 'HOT' && (!selectedTopic || newMsg.topicName === selectedTopic.name)) {
              addMessage(newMsg);
              setNewMessageHighlight(newMsg.id);
              setTimeout(() => setNewMessageHighlight(null), 2000);
            }
          }
        });

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
      }
    };

    connectWS();

    return () => {
      wsService.unsubscribe('/topic/messages');
    };
  }, [selectedTopic, addMessage, filters.source]);

  // Fetch messages when topic or filters change
  useEffect(() => {
    if (selectedTopic) {
      fetchFilteredMessages(selectedTopic.id, { search: searchQuery });
      fetchQuickStats(selectedTopic.id);
    }
  }, [selectedTopic, filters, searchQuery, fetchFilteredMessages, fetchQuickStats]);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  // Filter messages locally for search (only for HOT source)
  const filteredMessages = filters.source === 'HOT'
    ? messages.filter((m) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesKey = m.key?.toLowerCase().includes(q);
          const matchesValue = m.value?.toLowerCase().includes(q);
          if (!matchesKey && !matchesValue) return false;
        }
        if (filters.showBookmarked && !m.isBookmarked) return false;
        return true;
      })
    : messages;

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleBookmarkToggle = async (e, msg) => {
    e.stopPropagation();
    await bookmarkMessage(msg.id, !msg.isBookmarked);
  };

  const handleArchiveTopic = async () => {
    if (!selectedTopic) return;

    setIsArchiving(true);
    try {
      await archiveTopic(selectedTopic.id);
      setShowArchiveModal(false);
      // Refresh stats to show new archive count
      fetchQuickStats(selectedTopic.id);
    } catch (error) {
      console.error('Failed to archive topic:', error);
      alert('Failed to archive topic. Please try again.');
    } finally {
      setIsArchiving(false);
    }
  };

  // Copy to clipboard with feedback
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const copyFormattedJson = useCallback(() => {
    if (selectedMessage?.value) {
      try {
        const formatted = JSON.stringify(JSON.parse(selectedMessage.value), null, 2);
        copyToClipboard(formatted);
      } catch {
        copyToClipboard(selectedMessage.value);
      }
    }
  }, [selectedMessage, copyToClipboard]);

  // Export handlers
  const handleExportAllJson = useCallback(() => {
    const filename = selectedTopic ? selectedTopic.name + '-messages' : 'kafka-messages';
    exportToJson(filteredMessages, filename);
    setShowExportMenu(false);
  }, [filteredMessages, selectedTopic]);

  const handleExportAllCsv = useCallback(() => {
    const filename = selectedTopic ? selectedTopic.name + '-messages' : 'kafka-messages';
    exportToCsv(filteredMessages, filename);
    setShowExportMenu(false);
  }, [filteredMessages, selectedTopic]);

  const handleExportSingleJson = useCallback(() => {
    if (selectedMessage) {
      const filename = 'message-' + (selectedMessage.key || selectedMessage.id);
      exportToJson(selectedMessage, filename);
    }
  }, [selectedMessage]);

  // Get message item class
  const getMessageItemClass = (msg) => {
    const classes = [MESSAGES.MESSAGE_ITEM];
    
    if (selectedMessage?.id === msg.id) {
      classes.push(MESSAGES.MESSAGE_ITEM_SELECTED);
    } else {
      classes.push(MESSAGES.MESSAGE_ITEM_DEFAULT);
    }
    
    if (newMessageHighlight === msg.id) {
      classes.push(MESSAGES.MESSAGE_ITEM_NEW);
    }
    
    return classes.join(' ');
  };

  const getExportDropdownBtnClass = MESSAGES.EXPORT_BTN + ' ' + MESSAGES.EXPORT_BTN_DROPDOWN;
  const getKeyViewerClass = MESSAGES.JSON_VIEWER + ' ' + MESSAGES.JSON_PLAIN;
  const getCopyBtnClass = copied ? MESSAGES.DETAIL_ACTION_BTN_SUCCESS : MESSAGES.DETAIL_ACTION_BTN;

  // Filter Bar Button Classes
  const getFilterArchiveBtnClass = MESSAGES.FILTER_ICON_BTN + ' ' + MESSAGES.FILTER_BTN_ARCHIVE;
  const getFilterEmailBtnClass = MESSAGES.FILTER_ICON_BTN + ' ' + MESSAGES.FILTER_BTN_EMAIL;

  return (
    <>
      <Header 
        title="Messages" 
        subtitle={selectedTopic ? 'Viewing ' + selectedTopic.name : 'Select a topic'}
        actions={
          wsConnected && filters.source === 'HOT' && (
            <Badge variant="success" size="sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Live
            </Badge>
          )
        }
      />
      
      {/* Quick Stats Bar */}
      {selectedTopic && (
        <div className="grid grid-cols-4 gap-4 px-6 mb-6">
           <Card className="p-4 flex items-center justify-between bg-card border-border/50">
             <div>
               <p className="text-sm text-muted-foreground">Total Messages</p>
               <p className="text-2xl font-bold text-foreground">{stats.totalMessages.toLocaleString()}</p>
             </div>
             <Database className="w-8 h-8 text-primary/50" />
           </Card>
           <Card className="p-4 flex items-center justify-between bg-card border-border/50">
             <div>
               <p className="text-sm text-muted-foreground">Errors (24h)</p>
               <p className="text-2xl font-bold text-red-500">{stats.errorCount}</p>
             </div>
             <AlertCircle className="w-8 h-8 text-red-500/50" />
           </Card>
           <Card className="p-4 flex items-center justify-between bg-card border-border/50">
             <div>
               <p className="text-sm text-muted-foreground">Throughput</p>
               <p className="text-2xl font-bold text-green-500">{stats.throughput}/min</p>
             </div>
             <PlayCircle className="w-8 h-8 text-green-500/50" />
           </Card>
           <Card className="p-4 flex items-center justify-between bg-card border-border/50">
             <div>
               <p className="text-sm text-muted-foreground">Storage Size</p>
               <p className="text-2xl font-bold text-blue-500">{stats.totalSize}</p>
             </div>
             <HardDrive className="w-8 h-8 text-blue-500/50" />
           </Card>
        </div>
      )}

      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={MESSAGES.CONTAINER}>
          {/* Message List Panel */}
          <div className={MESSAGES.LIST_PANEL}>
            <div className={MESSAGES.LIST_CARD}>
              {/* Header with export buttons */}
              <div className={MESSAGES.LIST_HEADER}>
                <div className={MESSAGES.LIST_HEADER_LEFT}>
                  <span className={MESSAGES.LIST_TITLE}>Messages</span>
                  <span className={MESSAGES.LIST_COUNT}>{filteredMessages.length}</span>
                </div>
                <div className={MESSAGES.LIST_HEADER_RIGHT}>
                  {/* Archive Button (Icon Only) */}
                  {filters.source !== 'ARCHIVE' && (
                    <button
                      onClick={() => setShowArchiveModal(true)}
                      className={`${getFilterArchiveBtnClass} ${!selectedTopic ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!selectedTopic}
                      title={selectedTopic ? "Archive all messages in this topic" : "Select a topic to archive"}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  {/* Email Button (Icon Only) */}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className={getFilterEmailBtnClass}
                    disabled={filteredMessages.length === 0}
                    title="Send Email Report"
                  >
                    <Mail className="w-4 h-4" />
                  </button>

                  <div className="relative" ref={exportMenuRef}>
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className={getExportDropdownBtnClass}
                      disabled={filteredMessages.length === 0}
                    >
                      <Download className={MESSAGES.EXPORT_ICON} />
                      Export
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>

                    {showExportMenu && (
                      <div className={MESSAGES.EXPORT_MENU}>
                        <button onClick={handleExportAllJson} className={MESSAGES.EXPORT_MENU_ITEM}>
                          <FileJson className="w-4 h-4 mr-2" /> Export as JSON
                        </button>
                        <button onClick={handleExportAllCsv} className={MESSAGES.EXPORT_MENU_ITEM}>
                          <FileText className="w-4 h-4 mr-2" /> Export as CSV
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Filters */}
              <div className="p-4 border-b border-border/50 space-y-4 bg-muted/30">
                <div className="flex gap-4">
                  {/* Topic selector */}
                  <div className="flex-1">
                    <select 
                      value={selectedTopic?.id || ''} 
                      onChange={(e) => { 
                        const t = topics.find(t => t.id === Number(e.target.value)); 
                        if (t) selectTopic(t); 
                      }}
                      className={MESSAGES.TOPIC_SELECT}
                    >
                      <option value="">Select topic...</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.messageCount || 0})</option>
                      ))}
                    </select>
                  </div>

                  {/* Search input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search key or value..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={MESSAGES.SEARCH_INPUT}
                    />
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="flex gap-2 items-center flex-wrap">
                   {/* Source Filter */}
                   <div className="flex items-center bg-background border border-border rounded-lg p-1">
                      <button 
                        onClick={() => handleFilterChange('source', 'HOT')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filters.source === 'HOT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Live (Hot)
                      </button>
                      <button 
                        onClick={() => handleFilterChange('source', 'ARCHIVE')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${filters.source === 'ARCHIVE' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Archive className="w-3 h-3" /> Archive
                      </button>
                   </div>

                   {/* Type Filter */}
                   <select
                      value={filters.messageType}
                      onChange={(e) => handleFilterChange('messageType', e.target.value)}
                      className={MESSAGES.FILTER_SELECT}
                    >
                      <option value="ALL">All Types</option>
                      <option value="NORMAL">Normal</option>
                      <option value="ERROR">Errors</option>
                      <option value="WARNING">Warnings</option>
                      <option value="SYSTEM">System</option>
                    </select>

                    {/* Bookmark Filter */}
                    <button
                      onClick={() => handleFilterChange('showBookmarked', !filters.showBookmarked)}
                      className={`${MESSAGES.FILTER_BTN} ${filters.showBookmarked ? MESSAGES.FILTER_BTN_ACTIVE : ''}`}
                    >
                      <Star className={`w-4 h-4 ${filters.showBookmarked ? 'fill-current' : ''}`} />
                      Bookmarked
                    </button>

                    {/* Date Range Filter (only for archive) */}
                    {filters.source === 'ARCHIVE' && (
                      <div className="relative flex items-center">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="datetime-local"
                          value={filters.dateFrom || ''}
                          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                          className={`${INPUTS.BASE} pl-10 text-sm`}
                        />
                      </div>
                    )}
                </div>
              </div>
              
              {/* Messages list */}
              <div className={MESSAGES.LIST_CONTENT}>
                {isLoading ? (
                  <div className={MESSAGES.LOADING_CONTAINER}>
                    <div className={MESSAGES.LOADING_SPINNER}></div>
                  </div>
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      onClick={() => selectMessage(msg)}
                      className={getMessageItemClass(msg)}
                    >
                      <div className={MESSAGES.MESSAGE_ITEM_HEADER}>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={(e) => handleBookmarkToggle(e, msg)}
                             className="text-muted-foreground hover:text-yellow-500 transition-colors"
                           >
                             <Star className={`w-3.5 h-3.5 ${msg.isBookmarked ? 'text-yellow-500 fill-current' : ''}`} />
                           </button>
                           <span className={MESSAGES.MESSAGE_ITEM_KEY}>{msg.key || '(no key)'}</span>
                        </div>
                        <span className={MESSAGES.MESSAGE_ITEM_TIME}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={MESSAGES.MESSAGE_ITEM_PREVIEW}>
                        {msg.value?.substring(0, 100)}{msg.value?.length > 100 ? '...' : ''}
                      </p>
                      <div className={MESSAGES.MESSAGE_ITEM_FOOTER}>
                        <div className="flex gap-2">
                          {msg.messageType === 'ERROR' && <Badge variant="error" size="sm">Error</Badge>}
                          {msg.messageType === 'WARNING' && <Badge variant="warning" size="sm">Warning</Badge>}
                          <Badge variant="neutral" size="sm">{msg.valueSize || 0} B</Badge>
                        </div>
                        <Badge 
                          variant={
                            msg.status === 'PROCESSED' ? 'success' : 
                            msg.status === 'ERROR' ? 'error' : 'neutral'
                          } 
                          size="sm"
                        >
                          {msg.status || 'RECEIVED'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={MESSAGES.EMPTY_STATE}>
                    <FileText className={MESSAGES.EMPTY_STATE_ICON} />
                    <p className={MESSAGES.EMPTY_STATE_TEXT}>
                      {selectedTopic ? 'No messages found matching filters' : 'Select a topic to view messages'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Message Detail Panel */}
          <div className={MESSAGES.DETAIL_PANEL}>
            {selectedMessage ? (
              <div className={MESSAGES.DETAIL_CARD}>
                {/* Header */}
                <div className={MESSAGES.DETAIL_HEADER}>
                  <div className={MESSAGES.DETAIL_HEADER_TOP}>
                    <span className={MESSAGES.DETAIL_TITLE}>Message Details</span>
                    <div className={MESSAGES.DETAIL_ACTIONS}>
                      <button 
                        onClick={(e) => handleBookmarkToggle(e, selectedMessage)}
                        className={`p-1.5 rounded-md transition-colors ${selectedMessage.isBookmarked ? 'text-yellow-500 bg-yellow-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={selectedMessage.isBookmarked ? "Remove bookmark" : "Bookmark message"}
                      >
                        <Star className={`w-4 h-4 ${selectedMessage.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={handleExportSingleJson} 
                        className={MESSAGES.DETAIL_ACTION_BTN} 
                        title="Export as JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={copyFormattedJson} 
                        className={getCopyBtnClass}
                        title="Copy JSON"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className={MESSAGES.DETAIL_META}>
                    <div className={MESSAGES.DETAIL_META_ITEM}>
                      <Hash className="w-4 h-4" />
                      <span>Partition: {selectedMessage.partition}</span>
                    </div>
                    <div className={MESSAGES.DETAIL_META_ITEM}>
                      <span>Offset: {selectedMessage.offset}</span>
                    </div>
                    <div className={MESSAGES.DETAIL_META_ITEM}>
                      <Clock className="w-4 h-4" />
                      <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                    </div>
                    <div className={MESSAGES.DETAIL_META_ITEM}>
                      <Radio className="w-4 h-4" />
                      <span>{selectedMessage.topicName}</span>
                    </div>
                  </div>
                  {/* Status Badge in Header */}
                  <div className="mt-3 flex gap-2">
                     <Badge variant={selectedMessage.messageType === 'ERROR' ? 'error' : 'neutral'} size="sm">
                       {selectedMessage.messageType || 'NORMAL'}
                     </Badge>
                     <Badge variant="neutral" size="sm">
                       {selectedMessage.contentType || 'unknown'}
                     </Badge>
                  </div>
                </div>
                
                {/* Body */}
                <div className={MESSAGES.DETAIL_BODY}>
                  {/* Key */}
                  <div className={MESSAGES.DETAIL_SECTION}>
                    <h4 className={MESSAGES.DETAIL_SECTION_TITLE}>Key</h4>
                    <div className={getKeyViewerClass}>
                      {selectedMessage.key || '(no key)'}
                    </div>
                  </div>
                  
                  {/* Value with syntax highlighting */}
                  <div className={MESSAGES.DETAIL_SECTION}>
                    <h4 className={MESSAGES.DETAIL_SECTION_TITLE}>Value</h4>
                    <JsonViewer data={selectedMessage.value} />
                  </div>
                  
                  {/* Headers */}
                  {selectedMessage.headers && Object.keys(selectedMessage.headers).length > 0 && (
                    <div className={MESSAGES.DETAIL_SECTION}>
                      <h4 className={MESSAGES.DETAIL_SECTION_TITLE}>Headers</h4>
                      <div className={MESSAGES.HEADERS_TABLE_WRAPPER}>
                        <table className={MESSAGES.HEADERS_TABLE}>
                          <thead>
                            <tr>
                              <th className={MESSAGES.HEADERS_TH}>Key</th>
                              <th className={MESSAGES.HEADERS_TH}>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(selectedMessage.headers).map(([k, v]) => (
                              <tr key={k}>
                                <td className={MESSAGES.HEADERS_TD_KEY}>{k}</td>
                                <td className={MESSAGES.HEADERS_TD_VALUE}>{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={MESSAGES.EMPTY_STATE_PANEL}>
                <FileText className={MESSAGES.EMPTY_STATE_PANEL_ICON} />
                <p>Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className={MESSAGES.MODAL_OVERLAY}>
          <div className={MESSAGES.MODAL_CARD}>
            <div className={MESSAGES.MODAL_HEADER}>
              <h3 className={MESSAGES.MODAL_TITLE}>Email Report</h3>
              <button onClick={() => setShowEmailModal(false)} className={MESSAGES.MODAL_CLOSE_BTN}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={MESSAGES.MODAL_BODY}>
              <div>
                <label className={MESSAGES.MODAL_LABEL}>Recipient Email</label>
                <input type="email" placeholder="recipient@example.com" className={MESSAGES.MODAL_INPUT} />
              </div>
              <div>
                <label className={MESSAGES.MODAL_LABEL}>Subject</label>
                <input type="text" defaultValue={`Kafka Report: ${selectedTopic?.name}`} className={MESSAGES.MODAL_INPUT} />
              </div>
              <div>
                <label className={MESSAGES.MODAL_LABEL}>Message (optional)</label>
                <textarea placeholder="Add a note..." rows={3} className={MESSAGES.MODAL_TEXTAREA}></textarea>
              </div>
              <div className={MESSAGES.MODAL_HELP_TEXT}>
                This will send a report of the currently filtered {filteredMessages.length} messages.
              </div>
            </div>
            <div className={MESSAGES.MODAL_FOOTER}>
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                alert('Email functionality not yet implemented.');
                setShowEmailModal(false);
              }}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className={MESSAGES.MODAL_OVERLAY}>
          <div className={MESSAGES.MODAL_CARD}>
            <div className={MESSAGES.MODAL_HEADER}>
              <h3 className={MESSAGES.MODAL_TITLE}>Archive Topic Messages</h3>
              <button onClick={() => setShowArchiveModal(false)} className={MESSAGES.MODAL_CLOSE_BTN}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={MESSAGES.MODAL_BODY}>
              <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <Archive className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Archive Action</p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    This will copy all current messages from the topic <strong>{selectedTopic?.name}</strong> to the long-term archive storage.
                  </p>
                </div>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Messages will remain in Kafka (Hot Storage) until they expire naturally, but you will have a secured copy in the Archive immediately.
              </p>
            </div>
            <div className={MESSAGES.MODAL_FOOTER}>
              <Button variant="outline" onClick={() => setShowArchiveModal(false)} disabled={isArchiving}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleArchiveTopic}
                disabled={isArchiving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isArchiving ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" /> Confirm Archive
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}