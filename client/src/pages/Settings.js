import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Key, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="card" style={{ maxWidth: 800, marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          Application Settings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Theme */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layout size={18} className="text-accent" /> Appearance
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Customize the look and feel of your dashboard.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm active" style={{ border: '1px solid var(--color-accent-primary)' }}>Dark</button>
              <button className="btn btn-ghost btn-sm" onClick={() => toast.error('Light theme coming soon!')}>Light</button>
              <button className="btn btn-ghost btn-sm">System</button>
            </div>
          </div>

          <div className="divider" style={{ margin: 0 }} />

          {/* Notifications */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={18} className="text-accent" /> Email Notifications
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Manage what emails you receive from us.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-accent-primary)' }} />
                <span style={{ fontSize: '0.875rem' }}>Weekly Analytics Report</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-accent-primary)' }} />
                <span style={{ fontSize: '0.875rem' }}>Link Expiry Alerts</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--color-accent-primary)' }} />
                <span style={{ fontSize: '0.875rem' }}>Product Updates</span>
              </label>
            </div>
          </div>

          <div className="divider" style={{ margin: 0 }} />

          {/* API Keys */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={18} className="text-accent" /> API Access
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: 300 }}>
                Generate API keys to integrate LinkVault with your own applications.
              </p>
            </div>
            <div>
               <button className="btn btn-secondary btn-sm" onClick={() => toast.success('API Key generated! (Demo)')}>Generate New Key</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-primary" onClick={handleSave}>Save Preferences</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
