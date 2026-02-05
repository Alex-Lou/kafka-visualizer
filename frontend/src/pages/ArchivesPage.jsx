import { useEffect, useState, useCallback } from 'react';
import { 
  Archive, Search, Filter, Download, Trash2, RotateCcw, 
  ChevronDown, ChevronLeft, ChevronRight, X, FileJson, 
  FileText, Eye, Calendar, Database, Clock, AlertCircle,
  CheckSquare, Square, RefreshCw, Copy, ExternalLink
} from 'lucide-react';
import { Header, Card, Button, Badge } from '@components/common';
import { archiveApi } from '@services/api';

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const STYLES = {
  FILTERS_BAR: 'bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 mb-6',
  SEARCH_WRAPPER: 'relative',
  SEARCH_ICON: 'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400',
  SEARCH_INPUT: 'w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
  FILTER_SELECT: 'px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
  TABLE_CONTAINER: 'bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden',
  TABLE: 'w-full',
  TABLE_HEADER: 'bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700',
  TABLE_HEADER_CELL: 'px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider',
  TABLE_ROW: 'border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer',
  TABLE_CELL: 'px-4 py-3 text-sm text-surface-700 dark:text-surface-300',
  PAGINATION: 'flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700',
  STATS_GRID: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6',
  STAT_CARD: 'bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4',
  MODAL_BACKDROP: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4',
  MODAL_CONTENT: 'bg-white dark:bg-surface-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function ArchivesPage() {
  // State
  const [archives, setArchives] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [connectionFilter, setConnectionFilter] = useState('');
  const [messageTypeFilter, setMessageTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Modals
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════════

  const fetchArchives = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy: 'originalTimestamp',
        sortDirection: 'desc',
      };
      
      if (searchQuery) params.search = searchQuery;
      if (topicFilter) params.topicName = topicFilter;
      if (connectionFilter) params.connectionId = connectionFilter;
      if (messageTypeFilter) params.messageType = messageTypeFilter;
      if (dateFrom) params.fromDate = new Date(dateFrom).toISOString();
      if (dateTo) params.toDate = new Date(dateTo).toISOString();
      
      const response = await archiveApi.getAll(params);
      const data = response.data;
      
      setArchives(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError('Failed to load archives');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, topicFilter, connectionFilter, messageTypeFilter, dateFrom, dateTo]);

  const fetchStats = async () => {
    try {
      const response = await archiveApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await archiveApi.getFilterOptions();
      setFilterOptions(response.data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const handleExport = async (format, compress = false) => {
    try {
      const ids = selectedIds.size > 0 ? Array.from(selectedIds) : null;
      const params = { compress };
      if (ids) params.ids = ids;
      
      let response;
      if (format === 'json') {
        response = await archiveApi.exportJson(params);
      } else {
        response = await archiveApi.exportCsv(params);
      }
      
      // Download file
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `archives_${Date.now()}.${format}${compress ? '.gz' : ''}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setShowExportModal(false);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      await archiveApi.deleteBulk({ ids });
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      fetchArchives();
      fetchStats();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleRestore = async () => {
    try {
      const ids = Array.from(selectedIds);
      await archiveApi.restore({ ids, deleteAfterRestore: true });
      setSelectedIds(new Set());
      fetchArchives();
      fetchStats();
    } catch (err) {
      console.error('Restore failed:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(archives.map(a => a.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === archives.length);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTopicFilter('');
    setConnectionFilter('');
    setMessageTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <>
      <Header
        title="Archives"
        subtitle={`${totalElements.toLocaleString()} archived messages`}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              icon={RefreshCw} 
              onClick={() => { fetchArchives(); fetchStats(); }}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <main className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className={STYLES.STATS_GRID}>
            <div className={STYLES.STAT_CARD}>
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Archive className="w-4 h-4" />
                <span className="text-xs">Total Archives</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {stats.totalArchives?.toLocaleString() || 0}
              </p>
            </div>
            <div className={STYLES.STAT_CARD}>
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-xs">Total Size</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {stats.totalSizeFormatted || '0 B'}
              </p>
            </div>
            <div className={STYLES.STAT_CARD}>
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Last 24h</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {stats.archivedLast24h?.toLocaleString() || 0}
              </p>
            </div>
            <div className={STYLES.STAT_CARD}>
              <div className="flex items-center gap-2 text-surface-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Last 7 Days</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {stats.archivedLast7d?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={STYLES.FILTERS_BAR}>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className={`${STYLES.SEARCH_WRAPPER} flex-1 min-w-[200px]`}>
              <Search className={STYLES.SEARCH_ICON} />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                className={STYLES.SEARCH_INPUT}
              />
            </div>

            {/* Topic Filter */}
            <select
              value={topicFilter}
              onChange={(e) => { setTopicFilter(e.target.value); setPage(0); }}
              className={STYLES.FILTER_SELECT}
            >
              <option value="">All Topics</option>
              {filterOptions?.topicNames?.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Message Type Filter */}
            <select
              value={messageTypeFilter}
              onChange={(e) => { setMessageTypeFilter(e.target.value); setPage(0); }}
              className={STYLES.FILTER_SELECT}
            >
              <option value="">All Types</option>
              {filterOptions?.messageTypes?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className={STYLES.FILTER_SELECT}
              placeholder="From"
            />

            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className={STYLES.FILTER_SELECT}
              placeholder="To"
            />

            {/* Reset */}
            {(searchQuery || topicFilter || messageTypeFilter || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="w-4 h-4 mr-1" /> Reset
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <span className="text-sm text-surface-500">
                {selectedIds.size} selected
              </span>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Download}
                onClick={() => setShowExportModal(true)}
              >
                Export
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={RotateCcw}
                onClick={handleRestore}
              >
                Restore
              </Button>
              <Button 
                size="sm" 
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                className="bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 hover:bg-error-200"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className={STYLES.TABLE_CONTAINER}>
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
              <p className="text-surface-600 dark:text-surface-400">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchArchives} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <table className={STYLES.TABLE}>
                <thead className={STYLES.TABLE_HEADER}>
                  <tr>
                    <th className={STYLES.TABLE_HEADER_CELL} style={{ width: '40px' }}>
                      <button onClick={handleSelectAll}>
                        {selectAll ? (
                          <CheckSquare className="w-4 h-4 text-primary-500" />
                        ) : (
                          <Square className="w-4 h-4 text-surface-400" />
                        )}
                      </button>
                    </th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Topic</th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Key</th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Preview</th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Type</th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Size</th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Timestamp</th>
                    <th className={STYLES.TABLE_HEADER_CELL}>Archived</th>
                    <th className={STYLES.TABLE_HEADER_CELL} style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-surface-500">
                        Loading...
                      </td>
                    </tr>
                  ) : archives.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-surface-500">
                        No archives found
                      </td>
                    </tr>
                  ) : (
                    archives.map((archive) => (
                      <tr 
                        key={archive.id} 
                        className={STYLES.TABLE_ROW}
                        onClick={() => setSelectedArchive(archive)}
                      >
                        <td className={STYLES.TABLE_CELL} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleSelectOne(archive.id)}>
                            {selectedIds.has(archive.id) ? (
                              <CheckSquare className="w-4 h-4 text-primary-500" />
                            ) : (
                              <Square className="w-4 h-4 text-surface-400" />
                            )}
                          </button>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <span className="font-medium">{archive.topicName}</span>
                          <span className="block text-xs text-surface-400">{archive.connectionName}</span>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <code className="text-xs bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded">
                            {archive.messageKey || '-'}
                          </code>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <span className="text-xs text-surface-500 line-clamp-2 max-w-xs">
                            {archive.messageValuePreview || '-'}
                          </span>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <Badge 
                            variant={archive.messageType === 'ERROR' ? 'error' : archive.messageType === 'WARNING' ? 'warning' : 'secondary'} 
                            size="sm"
                          >
                            {archive.messageType}
                          </Badge>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <span className="text-xs">{archive.valueSizeFormatted}</span>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <span className="text-xs">
                            {archive.originalTimestamp ? new Date(archive.originalTimestamp).toLocaleString() : '-'}
                          </span>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <span className="text-xs text-surface-400">
                            {archive.archivedAt ? new Date(archive.archivedAt).toLocaleString() : '-'}
                          </span>
                        </td>
                        <td className={STYLES.TABLE_CELL}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedArchive(archive); }}
                            className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                          >
                            <Eye className="w-4 h-4 text-surface-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={STYLES.PAGINATION}>
                <div className="text-sm text-surface-500">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronRight}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Archive Detail Modal */}
      {selectedArchive && (
        <ArchiveDetailModal 
          archive={selectedArchive} 
          onClose={() => setSelectedArchive(null)} 
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal 
          count={selectedIds.size || totalElements}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          count={selectedIds.size}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ARCHIVE DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════

function ArchiveDetailModal({ archive, onClose }) {
  const [fullArchive, setFullArchive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFull = async () => {
      try {
        const response = await archiveApi.getById(archive.id);
        setFullArchive(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFull();
  }, [archive.id]);

  const data = fullArchive || archive;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJson = (value) => {
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div className={STYLES.MODAL_BACKDROP} onClick={onClose}>
      <div className={STYLES.MODAL_CONTENT} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Archive Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-surface-500">Loading...</div>
          ) : (
            <>
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Topic</label>
                  <p className="font-medium text-surface-900 dark:text-white">{data.topicName}</p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Connection</label>
                  <p className="font-medium text-surface-900 dark:text-white">{data.connectionName}</p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Message Key</label>
                  <code className="text-sm bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                    {data.messageKey || 'null'}
                  </code>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Partition / Offset</label>
                  <p className="text-surface-900 dark:text-white">
                    {data.partition ?? '-'} / {data.offset ?? '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Original Timestamp</label>
                  <p className="text-surface-900 dark:text-white">
                    {data.originalTimestamp ? new Date(data.originalTimestamp).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Archived At</label>
                  <p className="text-surface-900 dark:text-white">
                    {data.archivedAt ? new Date(data.archivedAt).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Type</label>
                  <Badge 
                    variant={data.messageType === 'ERROR' ? 'error' : data.messageType === 'WARNING' ? 'warning' : 'secondary'}
                  >
                    {data.messageType}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Size</label>
                  <p className="text-surface-900 dark:text-white">{data.valueSizeFormatted}</p>
                </div>
              </div>

              {/* Headers */}
              {data.headers && Object.keys(data.headers).length > 0 && (
                <div>
                  <label className="text-xs text-surface-500 block mb-2">Headers</label>
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 space-y-1">
                    {Object.entries(data.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-surface-500">{key}:</span>
                        <span className="text-surface-900 dark:text-white font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Value */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-surface-500">Message Value</label>
                  <button
                    onClick={() => copyToClipboard(data.messageValue)}
                    className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-surface-900 dark:bg-black text-green-400 rounded-lg p-4 text-xs overflow-x-auto max-h-80 font-mono">
                  {formatJson(data.messageValue) || 'null'}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT MODAL
// ═══════════════════════════════════════════════════════════════════════

function ExportModal({ count, onExport, onClose }) {
  const [compress, setCompress] = useState(false);

  return (
    <div className={STYLES.MODAL_BACKDROP} onClick={onClose}>
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          Export {count.toLocaleString()} Archives
        </h3>
        
        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700">
            <input
              type="checkbox"
              checked={compress}
              onChange={(e) => setCompress(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300"
            />
            <div>
              <span className="font-medium text-surface-900 dark:text-white">Compress (GZIP)</span>
              <p className="text-xs text-surface-500">Reduce file size for large exports</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex-1"
            icon={FileJson}
            onClick={() => onExport('json', compress)}
          >
            Export JSON
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1"
            icon={FileText}
            onClick={() => onExport('csv', compress)}
          >
            Export CSV
          </Button>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-3 py-2 text-sm text-surface-500 hover:text-surface-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════════

function DeleteModal({ count, onConfirm, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className={STYLES.MODAL_BACKDROP} onClick={onClose}>
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-error-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Delete Archives
            </h3>
            <p className="text-sm text-surface-500">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Are you sure you want to permanently delete <strong>{count}</strong> archived messages?
        </p>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-error-600 hover:bg-error-700 text-white"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}