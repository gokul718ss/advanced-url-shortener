import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Zap, Link2, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/os-components.css';

const FloatingHeader = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header 
      className="os-header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
      style={{ position: 'relative', top: 0, transform: 'none', width: '100%', maxWidth: '100%', marginBottom: 32 }}
    >
      <div className="os-header-search" style={{ maxWidth: 600 }}>
        <Search size={14} className="os-search-icon" />
        <input type="text" placeholder="Command Palette ⌘K" />
        <div className="os-search-shortcut">⌘K</div>
      </div>

      <div className="os-header-actions">
        <button className="os-icon-btn status-pulse">
          <Zap size={16} />
        </button>
        
        <button className="os-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="os-icon-btn">
          <Bell size={16} />
          <span className="os-badge"></span>
        </button>
      </div>
    </motion.header>
  );
};

export default FloatingHeader;
