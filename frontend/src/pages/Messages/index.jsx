import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header, Badge } from '@components/common';
import { useMessageStore, useTopicStore, useRetentionStore } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';
import wsService from '@services/websocket';
import emailService from '@services/emailService';

import MessageStatsBar from './MessageStatsBar';
import MessageListPanel from './MessageListPanel';
import MessageDetailPanel from './MessageDetailPanel';
import ArchiveModal from './ArchiveModal';
import EmailModal from './EmailModal';

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

const exportToTxt = (messages, filename) => {
  let txt = '';
  messages.forEach(msg => {
    txt += `--------------------------------------------------\n`;
    txt += `ID: ${msg.id || 'N/A'}\n`;
    txt += `Topic: ${msg.topicName || 'N/A'}\n`;
    txt += `Timestamp: ${msg.timestamp || 'N/A'}\n`;
    txt += `Key: ${msg.key || 'N/A'}\n`;
    txt += `Value: ${msg.value || 'N/A'}\n`;
    txt += `--------------------------------------------------\n\n`;
  });
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, filename + '.txt');
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
  const [searchParams] = useSearchParams();
  const {
    messages, selectedMessage, isLoading, stats, filters,
    fetchFilteredMessages, selectMessage, addMessage, setFilters,
    bookmarkMessage, fetchQuickStats
  } = useMessageStore();

  const { topics, selectedTopic, selectTopic, fetchAllTopics } = useTopicStore();
  const { archiveMessages, archiveTopics } = useRetentionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newMessageHighlight, setNewMessageHighlight] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('messages'); // 'messages' or 'topics'

  useEffect(() => {
    fetchAllTopics();
  }, [fetchAllTopics]);

  // Handle URL parameters for initial selection
  useEffect(() => {
    if (topics.length > 0) {
      const topicIdParam = searchParams.get('topicId');
      const connectionIdParam = searchParams.get('connectionId');

      if (topicIdParam) {
        const topicId = parseInt(topicIdParam, 10);
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          selectTopic(topic);
        }
      } else if (connectionIdParam) {
        const connectionId = parseInt(connectionIdParam, 10);
        const firstTopicForConnection = topics.find(t => t.connectionId === connectionId);
        if (firstTopicForConnection) {
          selectTopic(firstTopicForConnection);
        }
      }
    }
  }, [searchParams, topics, selectTopic]);

  useEffect(() => {
    const connectWS = async () => {
      try {
        await wsService.connect();
        setWsConnected(true);
        wsService.subscribe('/topic/messages', (message) => {
          if (message.type === 'NEW_MESSAGE' && message.payload) {
            const newMsg = message.payload;
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
    return () => wsService.unsubscribe('/topic/messages');
  }, [selectedTopic, addMessage, filters.source]);

  useEffect(() => {
    if (viewMode === 'messages' && selectedTopic) {
      fetchFilteredMessages(selectedTopic.id, { search: searchQuery });
      fetchQuickStats(selectedTopic.id);
      setSelectedMessageIds(new Set());
    }
  }, [selectedTopic, filters, searchQuery, fetchFilteredMessages, fetchQuickStats, viewMode]);

  const filteredMessages = useMemo(() => viewMode === 'messages' ? messages.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesKey = m.key?.toLowerCase().includes(q);
      const matchesValue = m.value?.toLowerCase().includes(q);
      if (!matchesKey && !matchesValue) return false;
    }
    if (filters.showBookmarked && !m.isBookmarked) return false;
    return true;
  }) : [], [messages, viewMode, searchQuery, filters.showBookmarked]);

  const hasVisibleBookmarked = useMemo(() => filteredMessages.some(m => m.isBookmarked), [filteredMessages]);

  const handleFilterChange = (key, value) => setFilters({ [key]: value });
  const handleBookmarkToggle = async (e, msg) => {
    e.stopPropagation();
    await bookmarkMessage(msg.id, !msg.isBookmarked);
  };

  const getItemsToActOn = () => {
    if (selectedMessageIds.size > 0) {
      return messages.filter(m => selectedMessageIds.has(m.id));
    }
    return filteredMessages;
  };

  const handleArchiveAction = async () => {
    const itemsToArchive = getItemsToActOn();
    if (itemsToArchive.length === 0) {
      alert("No messages to archive. Select messages or apply a filter.");
      return;
    }

    const idsToArchive = itemsToArchive.map(m => m.id);

    setIsArchiving(true);
    try {
      await archiveMessages(idsToArchive);
      setSelectedMessageIds(new Set());
      fetchFilteredMessages(selectedTopic.id);
      alert('Archive successful!');
    } catch (error) {
      console.error('Failed to archive:', error);
      alert('Failed to archive. Please try again.');
    } finally {
      setIsArchiving(false);
      setShowArchiveModal(false);
    }
  };

  const handleSendEmail = async (formData) => {
    setIsSendingEmail(true);
    try {
      let messagesForReport = [];
      
      if (formData.isSpecificSelection) {
        // Messages sélectionnés spécifiquement
        messagesForReport = messages
          .filter(m => formData.messageIds.includes(m.id))
          .map(m => ({ ...m }));
        
      } else {
        // Messages depuis les topics sélectionnés
        const response = await fetch('/api/report-query/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicIds: formData.topicIds }),
        });
        
        if (!response.ok) throw new Error('Failed to query messages for report.');
        
        const data = await response.json();

        // ✅ Gérer la structure ApiResponse
        if (Array.isArray(data)) {
          messagesForReport = data;
        } else if (data.data && Array.isArray(data.data)) {
          messagesForReport = data.data; // ApiResponse.success(messages)
        } else if (data.messages && Array.isArray(data.messages)) {
          messagesForReport = data.messages;
        } else {
          messagesForReport = [];
        }

        console.log('DEBUG - Extracted messages:', messagesForReport.length);

        
        console.log('DEBUG - Messages from topics count:', messagesForReport.length);
        console.log('DEBUG - Messages from topics sample:', messagesForReport[0]);
      }

      // Vérification critique
      console.log('DEBUG - Final messages count:', messagesForReport.length);
      console.log('DEBUG - Sending payload:', {
        recipient: formData.recipient,
        format: formData.format,
        messagesCount: messagesForReport.length
      });

      if (messagesForReport.length === 0) {
        alert('No messages to send in the report. Please select messages or topics with data.');
        setIsSendingEmail(false);
        return;
      }

      await emailService.sendReport({
        recipient: formData.recipient,
        subject: formData.subject,
        body: formData.body,
        format: formData.format,
        messages: messagesForReport,
      });

      alert('Email report sent successfully!');
      setShowEmailModal(false);
      
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Could not send the email report. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExport = (format, items) => {
    const itemsToExport = items || getItemsToActOn();
    if (itemsToExport.length === 0) {
      alert("No messages to export. Select messages or apply a filter.");
      return;
    }

    const baseFilename = selectedTopic ? `${selectedTopic.name}-export` : 'kafka-export';

    switch (format) {
      case 'json':
        exportToJson(itemsToExport, baseFilename);
        break;
      case 'csv':
        exportToCsv(itemsToExport, baseFilename);
        break;
      case 'txt':
        exportToTxt(itemsToExport, baseFilename);
        break;
      default:
        break;
    }
  };

  const handleExportBookmarked = (format) => {
    const bookmarkedMessages = filteredMessages.filter(m => m.isBookmarked);
    handleExport(format, bookmarkedMessages);
  };

  const handleSelectionChange = (messageId) => {
    const newSelection = new Set(selectedMessageIds);
    newSelection.has(messageId) ? newSelection.delete(messageId) : newSelection.add(messageId);
    setSelectedMessageIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedMessageIds.size === filteredMessages.length) {
      setSelectedMessageIds(new Set());
    } else {
      setSelectedMessageIds(new Set(filteredMessages.map(m => m.id)));
    }
  };

  const handleTopicSelectionChange = (topicId) => {
    const newSelection = new Set(selectedTopicIds);
    newSelection.has(topicId) ? newSelection.delete(topicId) : newSelection.add(topicId);
    setSelectedTopicIds(newSelection);
  };

  const handleSelectAllTopics = () => {
    if (selectedTopicIds.size === topics.length) {
      setSelectedTopicIds(new Set());
    } else {
      setSelectedTopicIds(new Set(topics.map(t => t.id)));
    }
  };

  return (
    <>
      <Header title="Messages" subtitle="View and manage topic messages" />
      <MessageStatsBar stats={stats} selectedTopic={selectedTopic} />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className="flex flex-col lg:flex-row gap-6">
          <MessageListPanel
            messages={filteredMessages}
            selectedTopic={selectedTopic}
            topics={topics}
            filters={filters}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSelectMessage={selectMessage}
            onFilterChange={handleFilterChange}
            onSearchChange={setSearchQuery}
            onSelectTopic={selectTopic}
            onBookmarkToggle={handleBookmarkToggle}
            onExport={handleExport}
            onExportBookmarked={handleExportBookmarked}
            hasVisibleBookmarked={hasVisibleBookmarked}
            onShowArchiveModal={() => setShowArchiveModal(true)}
            onShowEmailModal={() => setShowEmailModal(true)}
            selectedMessage={selectedMessage}
            newMessageHighlight={newMessageHighlight}
            selectedMessageIds={selectedMessageIds}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            selectedTopicIds={selectedTopicIds}
            onTopicSelectionChange={handleTopicSelectionChange}
            onSelectAllTopics={handleSelectAllTopics}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <MessageDetailPanel
            selectedMessage={selectedMessage}
            onBookmarkToggle={handleBookmarkToggle}
          />
        </div>
      </main>
      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onSubmit={handleArchiveAction}
        isArchiving={isArchiving}
        selectionCount={selectedMessageIds.size > 0 ? selectedMessageIds.size : filteredMessages.length}
        viewMode={viewMode}
      />
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleSendEmail}
        isSending={isSendingEmail}
        topics={topics}
        selectedMessages={messages.filter(m => selectedMessageIds.has(m.id))}
        viewMode={viewMode}
      />
    </>
  );
}
