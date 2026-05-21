import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Link2, PlusCircle, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/os-components.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: Link2, label: 'Links', path: '/dashboard/links' },
  { icon: PlusCircle, label: 'Create', path: '/dashboard/create' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' }
];

const FloatingDock = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="os-dock-container">
      <motion.div 
        className="os-dock"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
      >
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `os-dock-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  className="os-dock-icon-wrapper"
                  whileHover={{ scale: 1.2, y: -10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <div className="os-dock-tooltip">{item.label}</div>
                {isActive && <motion.div layoutId="dock-indicator" className="os-dock-indicator" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'var(--color-border)', margin: '0 8px' }} />

        {/* Logout Button */}
        <div className="os-dock-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <motion.div
            className="os-dock-icon-wrapper"
            style={{ color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            whileHover={{ scale: 1.2, y: -10, backgroundColor: 'var(--color-error-bg)' }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOut size={22} strokeWidth={2} />
          </motion.div>
          <div className="os-dock-tooltip" style={{ color: 'var(--color-error)' }}>Logout</div>
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingDock;
