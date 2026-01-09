import { Button } from '@components/common';
import { MESSAGES } from '@constants/styles/messages';
import { Archive, X } from 'lucide-react';

export default function ArchiveModal({ isOpen, onClose, onSubmit, isArchiving, selectionCount, viewMode }) {
  if (!isOpen) return null;

  const title = `Archive ${selectionCount} ${viewMode === 'topics' ? 'Topic(s)' : 'Message(s)'}`;
  const description = `This will move all messages from the ${selectionCount} selected ${viewMode === 'topics' ? 'topic(s)' : 'message(s)'} to the long-term archive storage.`;

  return (
    <div className={MESSAGES.MODAL_OVERLAY}>
      <div className={MESSAGES.MODAL_CARD}>
        <div className={MESSAGES.MODAL_HEADER}>
          <h3 className={MESSAGES.MODAL_TITLE}>{title}</h3>
          <button onClick={onClose} className={MESSAGES.MODAL_CLOSE_BTN}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={MESSAGES.MODAL_BODY}>
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <Archive className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Archive Action</p>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">{description}</p>
            </div>
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            This action is irreversible. The messages will be moved from Hot Storage (Kafka) to the Archive.
          </p>
        </div>
        <div className={MESSAGES.MODAL_FOOTER}>
          <Button variant="outline" onClick={onClose} disabled={isArchiving}>Cancel</Button>
          <Button
            variant="primary"
            onClick={onSubmit}
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
  );
}