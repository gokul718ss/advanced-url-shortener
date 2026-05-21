import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, ChevronDown, ChevronUp, Calendar, Tag, Zap,
  ExternalLink, Copy, Check,
} from 'lucide-react';
import { urlService } from '../services/api';
import toast from 'react-hot-toast';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const CreateUrlForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    expiryDate: '',
    tags: '',
    generateQR: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else {
      try {
        const url = formData.originalUrl.startsWith('http') ? formData.originalUrl : `https://${formData.originalUrl}`;
        new URL(url);
      } catch {
        newErrors.originalUrl = 'Please enter a valid URL';
      }
    }
    if (formData.customAlias && !/^[a-zA-Z0-9_-]{3,30}$/.test(formData.customAlias)) {
      newErrors.customAlias = 'Alias: 3-30 chars, letters/numbers/hyphens only';
    }
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        originalUrl: formData.originalUrl,
        generateQR: formData.generateQR,
      };
      if (formData.customAlias) payload.customAlias = formData.customAlias;
      if (formData.title) payload.title = formData.title;
      if (formData.expiryDate) payload.expiryDate = formData.expiryDate;
      if (formData.tags) payload.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      const response = await urlService.createUrl(payload);
      const newUrl = response.data.data.url;
      setCreatedUrl(newUrl);
      setFormData({ originalUrl: '', customAlias: '', title: '', expiryDate: '', tags: '', generateQR: true });
      setShowAdvanced(false);
      if (onCreated) onCreated(newUrl);
      toast.success('🎉 Short URL created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create URL';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(e => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);

  return (
    <div className="create-url-card">
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Shorten a URL
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Paste your long URL and get a beautiful short link instantly
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Main URL Input */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <Link2
                size={16}
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-text-muted)'
                }}
              />
              <input
                type="text"
                name="originalUrl"
                placeholder="https://your-very-long-url.com/with/lots/of/path..."
                value={formData.originalUrl}
                onChange={handleChange}
                className={`form-input ${errors.originalUrl ? 'error' : ''}`}
                style={{ paddingLeft: '42px', height: '48px' }}
              />
            </div>
            {errors.originalUrl && (
              <p className="form-error" style={{ marginTop: 4 }}>{errors.originalUrl}</p>
            )}
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ height: '48px', minWidth: '140px' }}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <><div className="spinner" /> <span>Shortening...</span></>
            ) : (
              <><Zap size={16} /> <span>Shorten URL</span></>
            )}
          </motion.button>
        </div>

        {/* Advanced Toggle */}
        <button
          type="button"
          className="url-advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="url-advanced-options">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Custom Alias (optional)</label>
                  <input
                    type="text"
                    name="customAlias"
                    placeholder="my-custom-link"
                    value={formData.customAlias}
                    onChange={handleChange}
                    className={`form-input ${errors.customAlias ? 'error' : ''}`}
                  />
                  {errors.customAlias && <p className="form-error">{errors.customAlias}</p>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Expiry Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`form-input ${errors.expiryDate ? 'error' : ''}`}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {errors.expiryDate && <p className="form-error">{errors.expiryDate}</p>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <Tag size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Descriptive title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="marketing, social, campaign"
                    value={formData.tags}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">QR Code</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="generateQR"
                      checked={formData.generateQR}
                      onChange={handleChange}
                      style={{ accentColor: 'var(--color-accent-primary)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      Generate QR code
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Created URL Result */}
      <AnimatePresence>
        {createdUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg)',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: 4 }}>
                  ✓ URL Created Successfully
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <a
                    href={createdUrl.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--color-accent-tertiary)',
                    }}
                  >
                    {createdUrl.shortUrl}
                  </a>
                  <ExternalLink size={14} color="var(--color-text-muted)" />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
                  → {createdUrl.originalUrl.slice(0, 80)}...
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <motion.button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(createdUrl.shortUrl)}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>

                {createdUrl.qrCode && (
                  <div style={{ padding: 8, background: 'white', borderRadius: 8 }}>
                    <QRCode value={createdUrl.shortUrl} size={80} level="M" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateUrlForm;
