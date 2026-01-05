import { useEffect, useState } from 'react';
import { FileText, Search, Copy, ExternalLink, Clock, Hash } from 'lucide-react';
import { Header, Card, Badge } from '@components/common';
import { useMessageStore, useTopicStore, useConnectionStore } from '@context/store';
import { MESSAGES } from '@constants/styles/messages';
import { LAYOUT } from '@constants/styles/layout';

export default function MessagesPage() {
  const { messages, selectedMessage, isLoading, fetchRecentMessages, selectMessage } = useMessageStore();
  const { topics, selectedTopic, selectTopic } = useTopicStore();
  const { connections, selectedConnection } = useConnectionStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedTopic) fetchRecentMessages(selectedTopic.id);
  }, [selectedTopic]);

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.key?.toLowerCase().includes(q) || m.value?.toLowerCase().includes(q);
  });

  const formatJson = (str) => {
    try { return JSON.stringify(JSON.parse(str), null, 2); } catch { return str; }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };

  return (
    <>
      <Header title="Messages" subtitle={selectedTopic ? `Viewing ${selectedTopic.name}` : 'Select a topic'} />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={MESSAGES.CONTAINER}>
          {/* Message List Panel */}
          <div className={MESSAGES.LIST_PANEL}>
            <div className={MESSAGES.LIST_CARD}>
              <div className={MESSAGES.LIST_HEADER}>
                <span className={MESSAGES.LIST_TITLE}>Messages</span>
                <span className={MESSAGES.LIST_COUNT}>{filteredMessages.length}</span>
              </div>
              <div className={MESSAGES.LIST_FILTERS}>
                <select value={selectedTopic?.id || ''} onChange={(e) => { const t = topics.find(t => t.id === Number(e.target.value)); if (t) selectTopic(t); }}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm">
                  <option value="">Select topic...</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className={MESSAGES.LIST_CONTENT}>
                {filteredMessages.map((msg) => (
                  <div key={msg.id} onClick={() => selectMessage(msg)}
                    className={`${MESSAGES.MESSAGE_ITEM} ${selectedMessage?.id === msg.id ? MESSAGES.MESSAGE_ITEM_SELECTED : MESSAGES.MESSAGE_ITEM_DEFAULT}`}>
                    <div className={MESSAGES.MESSAGE_ITEM_HEADER}>
                      <span className={MESSAGES.MESSAGE_ITEM_KEY}>{msg.key || '(no key)'}</span>
                      <span className={MESSAGES.MESSAGE_ITEM_TIME}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className={MESSAGES.MESSAGE_ITEM_PREVIEW}>{msg.value?.substring(0, 100)}...</p>
                    <div className={MESSAGES.MESSAGE_ITEM_FOOTER}>
                      <Badge variant={msg.direction === 'INBOUND' ? 'primary' : 'accent'} size="sm">{msg.direction}</Badge>
                      <Badge variant={msg.status === 'PROCESSED' ? 'success' : msg.status === 'ERROR' ? 'error' : 'neutral'} size="sm">{msg.status}</Badge>
                    </div>
                  </div>
                ))}
                {filteredMessages.length === 0 && (
                  <div className={MESSAGES.EMPTY_STATE}><FileText className={MESSAGES.EMPTY_STATE_ICON} /><p className={MESSAGES.EMPTY_STATE_TEXT}>No messages</p></div>
                )}
              </div>
            </div>
          </div>
          {/* Message Detail Panel */}
          <div className={MESSAGES.DETAIL_PANEL}>
            {selectedMessage ? (
              <div className={MESSAGES.DETAIL_CARD}>
                <div className={MESSAGES.DETAIL_HEADER}>
                  <div className={MESSAGES.DETAIL_HEADER_TOP}>
                    <span className={MESSAGES.DETAIL_TITLE}>Message Details</span>
                    <div className={MESSAGES.DETAIL_ACTIONS}>
                      <button onClick={() => copyToClipboard(selectedMessage.value)} className={MESSAGES.DETAIL_ACTION_BTN} title="Copy"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className={MESSAGES.DETAIL_META}>
                    <div className={MESSAGES.DETAIL_META_ITEM}><Hash className="w-4 h-4" /><span>Partition: {selectedMessage.partition}</span></div>
                    <div className={MESSAGES.DETAIL_META_ITEM}><span>Offset: {selectedMessage.offset}</span></div>
                    <div className={MESSAGES.DETAIL_META_ITEM}><Clock className="w-4 h-4" /><span>{new Date(selectedMessage.timestamp).toLocaleString()}</span></div>
                  </div>
                </div>
                <div className={MESSAGES.DETAIL_BODY}>
                  <div className={MESSAGES.DETAIL_SECTION}>
                    <h4 className={MESSAGES.DETAIL_SECTION_TITLE}>Key</h4>
                    <div className={MESSAGES.JSON_VIEWER}>{selectedMessage.key || '(no key)'}</div>
                  </div>
                  <div className={MESSAGES.DETAIL_SECTION}>
                    <h4 className={MESSAGES.DETAIL_SECTION_TITLE}>Value</h4>
                    <pre className={MESSAGES.JSON_VIEWER}>{formatJson(selectedMessage.value)}</pre>
                  </div>
                  {selectedMessage.headers && Object.keys(selectedMessage.headers).length > 0 && (
                    <div className={MESSAGES.DETAIL_SECTION}>
                      <h4 className={MESSAGES.DETAIL_SECTION_TITLE}>Headers</h4>
                      <table className={MESSAGES.HEADERS_TABLE}>
                        <thead><tr><th className={MESSAGES.HEADERS_TH}>Key</th><th className={MESSAGES.HEADERS_TH}>Value</th></tr></thead>
                        <tbody>
                          {Object.entries(selectedMessage.headers).map(([k, v]) => (
                            <tr key={k}><td className={MESSAGES.HEADERS_TD_KEY}>{k}</td><td className={MESSAGES.HEADERS_TD_VALUE}>{v}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-500"><p>Select a message to view details</p></div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
