import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Home, Link2, Plus, Search, Settings, User } from 'lucide-react';
import { useUI } from '../context/UIContext';

const CommandPalette = () => {
  const navigate = useNavigate();
  const { isCommandOpen, closeCommandPalette } = useUI();
  const [query, setQuery] = useState('');

  const actions = useMemo(() => ([
    { icon: Home, label: 'Go to Dashboard', path: '/dashboard' },
    { icon: Link2, label: 'Open My Links', path: '/dashboard/links' },
    { icon: Plus, label: 'Create New Link', path: '/dashboard/create' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ]), []);

  const filtered = actions.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const onSelect = (path) => {
    navigate(path);
    closeCommandPalette();
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isCommandOpen && (
        <>
          <motion.div
            className="cmdk-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
          />
          <motion.div
            className="cmdk-panel"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            <div className="cmdk-input-wrap">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands..."
                autoFocus
              />
            </div>
            <div className="cmdk-list">
              {filtered.map((item) => (
                <button key={item.path} className="cmdk-item" onClick={() => onSelect(item.path)}>
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="cmdk-empty">No command found</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
