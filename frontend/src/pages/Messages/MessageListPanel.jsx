import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Search, Download, FileJson, Archive, Mail, Star, ChevronDown, List, MessageSquare } from 'lucide-react';
import { Badge } from '@components/common';
import { MESSAGES } from '@constants/styles/messages';
import { INPUTS } from '@constants/styles/components';

const BookmarkFilterButton = ({ filter, onExport, hasVisibleBookmarked }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const baseButtonClass = `${MESSAGES.FILTER_BTN} ${filter.value ? MESSAGES.FILTER_BTN_ACTIVE : ''}`;
  const showArrow = hasVisibleBookmarked && !filter.value;

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button
        onClick={() => filter.onChange('showBookmarked', !filter.value)}
        className={`${baseButtonClass} ${showArrow ? 'rounded-l-lg' : 'rounded-lg'}`}
      >
        <Star className={`w-4 h-4 ${filter.value ? 'fill-current' : ''}`} />
        Bookmarked
      </button>
      {showArrow && (
        <>
          <div className="border-l border-gray-300 dark:border-gray-600" style={{ height: '2.25rem' }}></div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`${MESSAGES.FILTER_BTN} rounded-r-lg px-2`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-10 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-10 overflow-hidden">
              <button onClick={() => onExport('json')} className={MESSAGES.EXPORT_MENU_ITEM}><FileJson className="w-4 h-4 mr-2" /> Export Bookmarked (JSON)</button>
              <button onClick={() => onExport('csv')} className={MESSAGES.EXPORT_MENU_ITEM}><FileText className="w-4 h-4 mr-2" /> Export Bookmarked (CSV)</button>
              <button onClick={() => onExport('txt')} className={MESSAGES.EXPORT_MENU_ITEM}><FileText className="w-4 h-4 mr-2" /> Export Bookmarked (TXT)</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function MessageListPanel({
  messages,
  selectedTopic,
  topics,
  filters,
  isLoading,
  searchQuery,
  onSelectMessage,
  onFilterChange,
  onSearchChange,
  onSelectTopic,
  onBookmarkToggle,
  onExport,
  onExportBookmarked,
  hasVisibleBookmarked,
  onShowArchiveModal,
  onShowEmailModal,
  selectedMessage,
  newMessageHighlight,
  selectedMessageIds,
  onSelectionChange,
  onSelectAll,
  selectedTopicIds,
  onTopicSelectionChange,
  onSelectAllTopics,
  viewMode,
  onViewModeChange,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // ✅ Resizable state
  const [panelWidth, setPanelWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  // ✅ Resize handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !panelRef.current) return;
    
    const panelRect = panelRef.current.getBoundingClientRect();
    const newWidth = e.clientX - panelRect.left;
    
    // Min 350px, max 900px
    setPanelWidth(Math.min(Math.max(newWidth, 350), 900));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // ✅ Global mouse events pour le resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const getMessageItemClass = (msg) => {
    const classes = [MESSAGES.MESSAGE_ITEM];
    if (selectedMessage?.id === msg.id) classes.push(MESSAGES.MESSAGE_ITEM_SELECTED);
    else classes.push(MESSAGES.MESSAGE_ITEM_DEFAULT);
    if (newMessageHighlight === msg.id) classes.push(MESSAGES.MESSAGE_ITEM_NEW);
    return classes.join(' ');
  };

  const getExportDropdownBtnClass = MESSAGES.EXPORT_BTN + ' ' + MESSAGES.EXPORT_BTN_DROPDOWN;
  const getFilterArchiveBtnClass = MESSAGES.FILTER_ICON_BTN + ' ' + MESSAGES.FILTER_BTN_ARCHIVE;
  const getFilterEmailBtnClass = MESSAGES.FILTER_ICON_BTN + ' ' + MESSAGES.FILTER_BTN_EMAIL;

  const numSelectedMessages = selectedMessageIds.size;
  const numSelectedTopics = selectedTopicIds.size;
  const allVisibleMessagesSelected = numSelectedMessages === messages.length && messages.length > 0;
  const allTopicsSelected = numSelectedTopics === topics.length && topics.length > 0;

  const isActionDisabled = viewMode === 'messages' ? numSelectedMessages === 0 : numSelectedTopics === 0;

  // ✅ Resize handle class
  const getResizeHandleClass = () => {
    return `${MESSAGES.RESIZE_HANDLE} ${isResizing ? MESSAGES.RESIZE_HANDLE_ACTIVE : MESSAGES.RESIZE_HANDLE_IDLE}`;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportMenuRef]);

  return (
    <div 
      ref={panelRef}
      className={MESSAGES.LIST_PANEL_WRAPPER}
      style={{ width: `${panelWidth}px` }}
    >
      <div className={MESSAGES.LIST_PANEL}>
        <div className={MESSAGES.LIST_CARD}>
          <div className={MESSAGES.LIST_HEADER}>
            <div className={MESSAGES.LIST_HEADER_LEFT}>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={viewMode === 'messages' ? allVisibleMessagesSelected : allTopicsSelected}
                onChange={viewMode === 'messages' ? onSelectAll : onSelectAllTopics}
                disabled={viewMode === 'messages' ? messages.length === 0 : topics.length === 0}
              />
              <span className={MESSAGES.LIST_TITLE}>{viewMode === 'messages' ? 'Messages' : 'Topics'}</span>
              <span className={MESSAGES.LIST_COUNT}>
                {viewMode === 'messages' && (numSelectedMessages > 0 ? `${numSelectedMessages} selected` : messages.length)}
                {viewMode === 'topics' && (numSelectedTopics > 0 ? `${numSelectedTopics} selected` : topics.length)}
              </span>
            </div>
            <div className={MESSAGES.LIST_HEADER_RIGHT}>
              <button onClick={onShowArchiveModal} className={`${getFilterArchiveBtnClass} ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isActionDisabled} title="Archive Selection">
                <Archive className="w-4 h-4" />
              </button>
              <button onClick={onShowEmailModal} className={getFilterEmailBtnClass} title="Send Email Report">
                <Mail className="w-4 h-4" />
              </button>
              <div className="relative" ref={exportMenuRef}>
                <button onClick={() => setShowExportMenu(!showExportMenu)} className={getExportDropdownBtnClass}>
                  <Download className={MESSAGES.EXPORT_ICON} /> Export
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>
                {showExportMenu && (
                  <div className={MESSAGES.EXPORT_MENU}>
                    <button onClick={() => onExport('json')} className={MESSAGES.EXPORT_MENU_ITEM}><FileJson className="w-4 h-4 mr-2" /> Export as JSON</button>
                    <button onClick={() => onExport('csv')} className={MESSAGES.EXPORT_MENU_ITEM}><FileText className="w-4 h-4 mr-2" /> Export as CSV</button>
                    <button onClick={() => onExport('txt')} className={MESSAGES.EXPORT_MENU_ITEM}><FileText className="w-4 h-4 mr-2" /> Export as TXT</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-border/50 space-y-4 bg-muted/30">
            <div className="flex items-center bg-background border border-border rounded-lg p-1 w-full">
              <button onClick={() => onViewModeChange('messages')} className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${viewMode === 'messages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <MessageSquare className="w-4 h-4" /> By Message
              </button>
              <button onClick={() => onViewModeChange('topics')} className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${viewMode === 'topics' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <List className="w-4 h-4" /> By Topic
              </button>
            </div>

            {viewMode === 'messages' && (
              <>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select value={selectedTopic?.id || ''} onChange={(e) => { const t = topics.find(t => t.id === Number(e.target.value)); if (t) onSelectTopic(t); }} className={MESSAGES.TOPIC_SELECT}>
                      <option value="">Select topic...</option>
                      {topics.map((t) => (<option key={t.id} value={t.id}>{t.name} ({t.messageCount || 0})</option>))}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Search key or value..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className={MESSAGES.SEARCH_INPUT} />
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="flex items-center bg-background border border-border rounded-lg p-1">
                    <button onClick={() => onFilterChange('source', 'HOT')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filters.source === 'HOT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Live (Hot)</button>
                    <button onClick={() => onFilterChange('source', 'ARCHIVE')} className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${filters.source === 'ARCHIVE' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Archive className="w-3 h-3" /> Archive</button>
                  </div>
                  <select value={filters.messageType} onChange={(e) => onFilterChange('messageType', e.target.value)} className={MESSAGES.FILTER_SELECT}>
                    <option value="ALL">All Types</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ERROR">Errors</option>
                    <option value="WARNING">Warnings</option>
                    <option value="SYSTEM">System</option>
                  </select>
                  <BookmarkFilterButton filter={{ value: filters.showBookmarked, onChange: onFilterChange }} onExport={onExportBookmarked} hasVisibleBookmarked={hasVisibleBookmarked} />
                </div>
              </>
            )}
          </div>

          <div className={MESSAGES.LIST_CONTENT}>
            {isLoading ? (
              <div className={MESSAGES.LOADING_CONTAINER}><div className={MESSAGES.LOADING_SPINNER}></div></div>
            ) : viewMode === 'messages' ? (
              messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} onClick={() => onSelectMessage(msg)} className={getMessageItemClass(msg)}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={selectedMessageIds.has(msg.id)} onChange={() => onSelectionChange(msg.id)} onClick={(e) => e.stopPropagation()} />
                      <div className="flex-1">
                        <div className={MESSAGES.MESSAGE_ITEM_HEADER}>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => onBookmarkToggle(e, msg)} className="text-muted-foreground hover:text-yellow-500 transition-colors"><Star className={`w-3.5 h-3.5 ${msg.isBookmarked ? 'text-yellow-500 fill-current' : ''}`} /></button>
                            <span className={MESSAGES.MESSAGE_ITEM_KEY}>{msg.key || '(no key)'}</span>
                          </div>
                          <span className={MESSAGES.MESSAGE_ITEM_TIME}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className={MESSAGES.MESSAGE_ITEM_PREVIEW}>{msg.value?.substring(0, 100)}{msg.value?.length > 100 ? '...' : ''}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={MESSAGES.EMPTY_STATE}><FileText className={MESSAGES.EMPTY_STATE_ICON} /><p className={MESSAGES.EMPTY_STATE_TEXT}>{selectedTopic ? 'No messages found' : 'Select a topic'}</p></div>
              )
            ) : (
              topics.map(topic => (
                <div key={topic.id} className="flex items-center gap-3 p-4 border-b border-surface-100 dark:border-surface-800">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={selectedTopicIds.has(topic.id)} onChange={() => onTopicSelectionChange(topic.id)} />
                  <div className="flex-1">
                    <p className="font-medium text-surface-800 dark:text-surface-200">{topic.name}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{topic.messageCount || 0} messages</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ✅ RESIZE HANDLE */}
      <div
        onMouseDown={handleMouseDown}
        className={getResizeHandleClass()}
      >
        <div className={MESSAGES.RESIZE_HANDLE_LINE} />
      </div>
    </div>
  );
}