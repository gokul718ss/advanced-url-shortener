import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Copy, Trash2, BarChart3, Edit2,
  Check, Link2, ChevronUp, ChevronDown, QrCode,
  RefreshCw, Download,
} from 'lucide-react';
import { urlService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import EditUrlModal from './EditUrlModal';
import '../styles/dashboard.css';

const statusFilters = ['all', 'active', 'expired', 'inactive'];

const UrlTable = ({ refreshTrigger }) => {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const navigate = useNavigate();

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await urlService.getAllUrls({ page, limit: 8, search, sortBy, sortOrder, status });
      setUrls(response.data.data);
      setPagination(response.data.meta?.pagination);
    } catch (err) {
      toast.error('Failed to load URLs');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sortBy, sortOrder, status, refreshTrigger]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch { toast.error('Copy failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await urlService.deleteUrl(id);
      setUrls(prev => prev.filter(u => u._id !== id));
      toast.success('Link deleted successfully');
    } catch { toast.error('Delete failed'); }
    finally { setDeletingId(null); }
  };

  const handleExport = async () => {
    try {
      const response = await urlService.exportAnalytics();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'url-analytics.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const getStatusBadge = (url) => {
    if (!url.isActive) return <span className="badge badge-inactive">Inactive</span>;
    if (url.isExpired) return <span className="badge badge-expired">Expired</span>;
    return <span className="badge badge-active">Active</span>;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className="url-table-container">
        {/* Table Header */}
        <div className="table-header">
          <div className="table-search">
            <Search size={15} className="table-search-icon" />
            <input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          <div className="filter-bar">
            {statusFilters.map(f => (
              <button
                key={f}
                className={`filter-btn ${status === f ? 'active' : ''}`}
                onClick={() => { setStatus(f); setPage(1); }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="table-actions">
            <button className="btn btn-ghost btn-sm" onClick={fetchUrls} title="Refresh">
              <RefreshCw size={15} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleExport} title="Export CSV">
              <Download size={15} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--color-accent-primary)', borderColor: 'rgba(99,102,241,0.2)' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading your links...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Link2 size={32} />
            </div>
            <h3 style={{ color: 'var(--color-text-primary)' }}>No links found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: 320, textAlign: 'center' }}>
              {search ? `No links match "${search}"` : 'Create your first short link to get started!'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="url-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Link <SortIcon field="title" />
                    </span>
                  </th>
                  <th>Short URL</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('clickCount')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Clicks <SortIcon field="clickCount" />
                    </span>
                  </th>
                  <th>Status</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Created <SortIcon field="createdAt" />
                    </span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {urls.map((url, idx) => (
                    <motion.tr
                      key={url._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <td className="url-cell-original">
                        {url.title && (
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                            {url.title}
                          </div>
                        )}
                        <a href={url.originalUrl} target="_blank" rel="noreferrer" title={url.originalUrl}>
                          {url.originalUrl.length > 50 ? url.originalUrl.slice(0, 50) + '...' : url.originalUrl}
                        </a>
                      </td>
                      <td>
                        <div className="url-short-link">
                          <a href={url.shortUrl} target="_blank" rel="noreferrer">
                            {url.shortCode}
                          </a>
                          <button
                            className="copy-btn"
                            onClick={() => handleCopy(url.shortUrl, url._id)}
                            title="Copy short URL"
                          >
                            {copiedId === url._id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="click-count">
                          <BarChart3 size={14} color="var(--color-accent-primary)" />
                          {url.clickCount.toLocaleString()}
                        </div>
                      </td>
                      <td>{getStatusBadge(url)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(url.createdAt)}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="action-btn analytics"
                            onClick={() => navigate(`/dashboard/analytics/${url.shortCode}`)}
                            title="View Analytics"
                          >
                            <BarChart3 size={14} />
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => setEditUrl(url)}
                            title="Edit Link"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => setQrUrl(url)}
                            title="View QR Code"
                          >
                            <QrCode size={14} />
                          </button>
                          <button
                            className="action-btn danger"
                            onClick={() => handleDelete(url._id)}
                            disabled={deletingId === url._id}
                            title="Delete Link"
                          >
                            {deletingId === url._id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {((page - 1) * 8) + 1}–{Math.min(page * 8, pagination.total)} of {pagination.total} links
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >«</button>
              <button
                className="page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.hasPrevPage}
              >‹</button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage}
              >›</button>
              <button
                className="page-btn"
                onClick={() => setPage(pagination.totalPages)}
                disabled={page === pagination.totalPages}
              >»</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editUrl && (
        <EditUrlModal
          url={editUrl}
          onClose={() => setEditUrl(null)}
          onSaved={(updated) => {
            setUrls(prev => prev.map(u => u._id === updated._id ? updated : u));
            setEditUrl(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrUrl && (
          <div className="modal-overlay" onClick={() => setQrUrl(null)}>
            <motion.div
              className="modal-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 360, textAlign: 'center' }}
            >
              <div className="modal-header">
                <h3 style={{ color: 'var(--color-text-primary)' }}>QR Code</h3>
                <button className="modal-close" onClick={() => setQrUrl(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ padding: 16, background: 'white', borderRadius: 12 }}>
                  <QRCode value={qrUrl.shortUrl} size={180} level="M" />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-accent-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
                {qrUrl.shortUrl}
              </p>
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = `qr-${qrUrl.shortCode}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                    toast.success('QR code downloaded!');
                  }
                }}
              >
                <Download size={16} /> Download QR Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UrlTable;
