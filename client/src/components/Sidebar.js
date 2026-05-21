import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Link2, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, User, Plus,
} from 'lucide-react';
import '../styles/dashboard.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/dashboard/links', icon: Link2, label: 'My Links' },
  { path: '/dashboard/create', icon: Plus, label: 'Create Link' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/dashboard/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 'calc(var(--z-sticky) - 1)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={onMobileClose}
        />
      )}

      <aside className={clsx('sidebar', isCollapsed && 'collapsed', isMobileOpen && 'mobile-open')}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Link2 size={18} color="white" />
            </div>
            {!isCollapsed && (
              <span className="sidebar-logo-text">LinkVault</span>
            )}
          </div>
          <button className="sidebar-toggle" onClick={onToggle} title={isCollapsed ? 'Expand' : 'Collapse'}>
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!isCollapsed && (
            <div className="sidebar-section-title">Navigation</div>
          )}

          {navItems.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) => clsx('nav-item', isActive && 'active')}
              title={isCollapsed ? label : ''}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />

          {!isCollapsed && (
            <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Account</div>
          )}

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
            title={isCollapsed ? 'Settings' : ''}
          >
            <Settings size={18} className="nav-icon" />
            <span className="nav-label">Settings</span>
          </NavLink>

          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ width: '100%', textAlign: 'left', color: 'var(--color-error)' }}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={18} className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        {/* Footer - User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate('/dashboard/profile')}>
            <div className="sidebar-avatar">
              {user?.profileImage ? (
                <img src={`http://localhost:5000${user.profileImage}`} alt={user.name} />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
