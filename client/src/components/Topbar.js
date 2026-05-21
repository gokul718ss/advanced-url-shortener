import React from 'react';
import { Menu, Plus, Search, Bell, Command, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import '../styles/dashboard.css';

const Topbar = ({ title, onMenuToggle }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, openCommandPalette } = useUI();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn" onClick={onMenuToggle} title="Toggle Sidebar">
          <Menu size={18} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <button className="topbar-search" onClick={openCommandPalette}>
          <Search size={14} />
          <span style={{ paddingRight: '12px' }}>Search...</span>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '2px', 
            background: 'rgba(255,255,255,0.1)', padding: '2px 6px', 
            borderRadius: '4px', fontSize: '0.7rem' 
          }}>
            <Command size={10} /> K
          </div>
        </button>

        <button className="topbar-btn" title="Notifications">
          <div style={{ position: 'relative' }}>
            <Bell size={18} />
            <span style={{ 
              position: 'absolute', top: -2, right: -2, 
              width: 8, height: 8, background: '#ef4444', 
              borderRadius: '50%', border: '2px solid #000' 
            }} />
          </div>
        </button>
        <button className="topbar-btn" title="Toggle theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          className="btn btn-accent btn-sm"
          onClick={() => navigate('/dashboard/create')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}
        >
          <Plus size={15} />
          <span>New Link</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
