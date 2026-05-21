import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/dashboard.css';

const DashboardLayout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const pageTitles = {
    '/dashboard': 'Overview',
    '/dashboard/links': 'All Links',
    '/dashboard/create': 'Create Link',
    '/dashboard/profile': 'Profile',
    '/dashboard/settings': 'Settings',
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard/analytics')) return 'Analytics';
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`dashboard-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar title={getPageTitle()} onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="page-container">
          <div className="card page-shell-card">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
