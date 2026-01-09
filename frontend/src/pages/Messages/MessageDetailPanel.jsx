import { FileText, Copy, Check, Clock, Hash, Radio, Download, Star } from 'lucide-react';
import { Badge } from '@components/common';
import { MESSAGES } from '@constants/styles/messages';
import JsonViewer from './JsonViewer';

export default function MessageDetailPanel({
  selectedMessage,
  copied,
  onBookmarkToggle,
  onExportSingleJson,
  copyFormattedJson
}) {
  const getKeyViewerClass = MESSAGES.JSON_VIEWER + ' ' + MESSAGES.JSON_PLAIN;
  const getCopyBtnClass = copied ? MESSAGES.DETAIL_ACTION_BTN_SUCCESS : MESSAGES.DETAIL_ACTION_BTN;

  // Ne rien afficher si aucun message sélectionné
  if (!selectedMessage) {
    return null;
  }

  return (
    <div className={MESSAGES.DETAIL_PANEL}>
      <div className={MESSAGES.DETAIL_CARD}>
        {/* Header */}
        <div className={MESSAGES.DETAIL_HEADER}>
          <div className={MESSAGES.DETAIL_HEADER_TOP}>
            <span className={MESSAGES.DETAIL_TITLE}>Message Details</span>
            <div className={MESSAGES.DETAIL_ACTIONS}>
              <button
                onClick={(e) => onBookmarkToggle(e, selectedMessage)}
                className={`p-1.5 rounded-md transition-colors ${selectedMessage.isBookmarked ? 'text-yellow-500 bg-yellow-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                title={selectedMessage.isBookmarked ? "Remove bookmark" : "Bookmark message"}
              >
                <Star className={`w-4 h-4 ${selectedMessage.isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onExportSingleJson}
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
    </div>
  );
}