import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Calendar, X } from 'lucide-react';
import { urlService } from '../services/api';
import toast from 'react-hot-toast';

const EditUrlModal = ({ url, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    originalUrl: url.originalUrl,
    title: url.title || '',
    expiryDate: url.expiryDate ? new Date(url.expiryDate).toISOString().slice(0, 16) : '',
    isActive: url.isActive,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        originalUrl: formData.originalUrl,
        title: formData.title || null,
        expiryDate: formData.expiryDate || null,
        isActive: formData.isActive,
      };
      const response = await urlService.updateUrl(url._id, payload);
      onSaved(response.data.data.url);
      toast.success('Link updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: 'rgba(99,102,241,0.1)',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--color-accent-primary)'
            }}>
              <Edit2 size={16} />
            </div>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1rem' }}>Edit Link</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/{url.shortCode}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Destination URL</label>
            <input
              type="url"
              name="originalUrl"
              value={formData.originalUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Descriptive title (optional)"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
              Expiry Date
            </label>
            <input
              type="datetime-local"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ accentColor: 'var(--color-accent-primary)', width: 16, height: 16 }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Link is active
            </span>
          </label>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={isLoading}>
              {isLoading ? <><div className="spinner" /><span>Saving...</span></> : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditUrlModal;
