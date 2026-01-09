import { useState, useEffect, useRef } from 'react';
import { Button } from '@components/common';
import { MESSAGES } from '@constants/styles/messages';
import { Mail, X } from 'lucide-react';

export default function EmailModal({
  isOpen,
  onClose,
  onSubmit,
  isSending,
  topics,
  selectedMessages,
}) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [format, setFormat] = useState('csv');
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());

  // Ref pour suivre si le modal a déjà été initialisé lors de cette ouverture
  const hasInitializedRef = useRef(false);

  const isSpecificSelectionMode = selectedMessages.length > 0;

  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      // Initialisation seulement à l'ouverture
      setRecipient('');
      setFormat('csv');
      setSelectedTopicIds(new Set());

      if (isSpecificSelectionMode) {
        setSubject(`Report for ${selectedMessages.length} selected messages`);
        const messageSummary = selectedMessages
          .map(msg => `- ID: ${msg.id} | Key: ${msg.key || 'N/A'}`)
          .join('\n');
        setBody(`Hello,\n\nPlease find attached a report for ${selectedMessages.length} specific messages.\n\nSummary:\n${messageSummary}\n\nRegards.`);
        
        console.log('DEBUG EmailModal - Specific selection mode with', selectedMessages.length, 'messages');
      } else {
        setSubject('New Kafka Report');
        setBody('Hello,\n\nPlease find attached a generated Kafka report.\n\nRegards.');
        
        console.log('DEBUG EmailModal - Topic selection mode');
      }

      hasInitializedRef.current = true;
    } else if (!isOpen) {
      // Reset le flag quand le modal se ferme
      hasInitializedRef.current = false;
    }
  }, [isOpen, isSpecificSelectionMode]);

  if (!isOpen) return null;

  const handleTopicSelection = (topicId) => {
    const newSelection = new Set(selectedTopicIds);
    if (newSelection.has(topicId)) {
      newSelection.delete(topicId);
    } else {
      newSelection.add(topicId);
    }
    setSelectedTopicIds(newSelection);
    console.log('DEBUG EmailModal - Selected topic IDs:', Array.from(newSelection));
  };

  const handleSubmit = () => {
    if (!recipient) {
      alert('Please enter a recipient email.');
      return;
    }
    
    console.log('DEBUG EmailModal - Submit clicked');
    console.log('DEBUG EmailModal - isSpecificSelection:', isSpecificSelectionMode);
    console.log('DEBUG EmailModal - selectedMessages:', selectedMessages);
    console.log('DEBUG EmailModal - selectedMessages count:', selectedMessages.length);
    console.log('DEBUG EmailModal - selectedTopicIds:', Array.from(selectedTopicIds));
    console.log('DEBUG EmailModal - format:', format);
    
    if (!isSpecificSelectionMode && selectedTopicIds.size === 0) {
      alert('Please select at least one topic for the report.');
      return;
    }

    const payload = {
      recipient,
      subject,
      body,
      format,
      isSpecificSelection: isSpecificSelectionMode,
      messageIds: isSpecificSelectionMode ? selectedMessages.map(m => m.id) : [],
      topicIds: Array.from(selectedTopicIds),
    };
    
    console.log('DEBUG EmailModal - Sending payload:', payload);
    
    onSubmit(payload);
  };

  return (
    <div className={MESSAGES.MODAL_OVERLAY}>
      <div className={`${MESSAGES.MODAL_CARD} max-w-2xl`}>
        <div className={MESSAGES.MODAL_HEADER}>
          <h3 className={MESSAGES.MODAL_TITLE}>Email Report</h3>
          <button onClick={onClose} className={MESSAGES.MODAL_CLOSE_BTN} disabled={isSending}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={MESSAGES.MODAL_BODY}>
          {isSpecificSelectionMode ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
              You are sending a report for the <strong>{selectedMessages.length} messages</strong> you have selected.
            </div>
          ) : (
            <div>
              <label className={MESSAGES.MODAL_LABEL}>1. Select Topics for Report</label>
              <div className="max-h-40 overflow-y-auto p-3 border rounded-lg bg-white dark:bg-surface-950 dark:border-surface-700">
                {topics.map(topic => (
                  <div key={topic.id} className="flex items-center gap-2 p-1">
                    <input
                      type="checkbox"
                      id={`topic-${topic.id}`}
                      checked={selectedTopicIds.has(topic.id)}
                      onChange={() => handleTopicSelection(topic.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor={`topic-${topic.id}`} className="flex-1">{topic.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={MESSAGES.MODAL_LABEL}>Recipient Email</label>
              <input
                type="email"
                placeholder="recipient@example.com"
                className={MESSAGES.MODAL_INPUT}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div>
              <label className={MESSAGES.MODAL_LABEL}>Attachment Format</label>
              <select
                className={MESSAGES.MODAL_INPUT}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={isSending}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="txt">Plain Text (TXT)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
          <div>
            <label className={MESSAGES.MODAL_LABEL}>Subject</label>
            <input
              type="text"
              className={MESSAGES.MODAL_INPUT}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>
          <div>
            <label className={MESSAGES.MODAL_LABEL}>Email Body</label>
            <textarea
              rows={8}
              className={MESSAGES.MODAL_TEXTAREA}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSending}
            ></textarea>
          </div>
        </div>
        <div className={MESSAGES.MODAL_FOOTER}>
          <Button variant="outline" onClick={onClose} disabled={isSending}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSending}>
            {isSending ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" /> Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
