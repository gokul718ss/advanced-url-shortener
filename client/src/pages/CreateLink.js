import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Upload, FileType, AlertCircle } from 'lucide-react';
import CreateUrlForm from '../components/CreateUrlForm';
import { urlService } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/create-link-premium.css';

const CreateLink = () => {
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'text/csv' || selected.name.endsWith('.csv'))) {
      setFile(selected);
    } else {
      toast.error('Please upload a valid CSV file');
      setFile(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setBulkResults(null);

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await urlService.bulkCreate(formData);
      setBulkResults(response.data.data);
      toast.success(`Successfully processed ${response.data.data.created.length} links`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,url,alias,title\nhttps://example.com,my-alias,Example Title\nhttps://google.com,,Google Search\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "linkvault-bulk-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      className="create-link-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="create-link-hero">
        <h2>Create high-converting short links</h2>
        <p>Build, brand, and launch links with premium routing and analytics-ready tracking.</p>
      </div>

      {/* Tabs */}
      <div className="create-link-tabs">
        <button
          className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('single')}
        >
          Single Link
        </button>
        <button
          className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Creation (CSV)
        </button>
      </div>

      {activeTab === 'single' ? (
        <CreateUrlForm />
      ) : (
        <div className="card create-link-bulk-card" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Bulk Create Links</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Upload a CSV file to shorten multiple URLs at once. Maximum 50 rows per file.
            </p>
          </div>

          <div style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            textAlign: 'center',
            background: 'var(--color-bg-secondary)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', color: 'var(--color-accent-primary)' }}>
                {file ? <FileType size={32} /> : <FileUp size={32} />}
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>
              {file ? file.name : 'Upload your CSV file'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
              {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Drag and drop or click to browse'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="csv-upload" className="btn btn-secondary">
                Browse Files
              </label>
              {file && (
                <button
                  className="btn btn-primary"
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                >
                  {isUploading ? <><div className="spinner"/> Processing...</> : <><Upload size={16} /> Process CSV</>}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.85rem' }}>Need a template?</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
              Download CSV Template
            </button>
          </div>

          {/* Bulk Results */}
          {bulkResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 'var(--spacing-xl)' }}
            >
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Results Overview</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, padding: 16, background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{bulkResults.summary.created}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Successfully Created</div>
                </div>
                <div style={{ flex: 1, padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-error)' }}>{bulkResults.summary.failed}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Failed</div>
                </div>
              </div>

              {bulkResults.errors.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--color-error)', marginBottom: 8, fontSize: '0.9rem' }}>Errors Log:</h4>
                  <div style={{ background: 'var(--color-bg-secondary)', padding: 16, borderRadius: 'var(--radius-md)', maxHeight: 200, overflowY: 'auto' }}>
                    {bulkResults.errors.map((err, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        Row {err.row}: {err.error} {err.url ? `(${err.url})` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CreateLink;
