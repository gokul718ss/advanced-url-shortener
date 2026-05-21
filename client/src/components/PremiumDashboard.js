import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Settings, Bell, User, LogOut, BarChart3, Link2, TrendingUp,
  Eye, MousePointerClick, RefreshCw, Download, Share2, Zap, Clock, Globe,
  ChevronDown, Filter, Calendar, MoreHorizontal
} from 'lucide-react';
import { Button, Card, CardBody, AnimatedCounter, EmptyState } from '../components/PremiumComponents';
import { useForm, useAnimationOnScroll, useLocalStorage, useTheme } from '../hooks';
import '../styles/dashboard.css';

/* ====================================
   PREMIUM FLOATING HEADER
   ==================================== */

const PremiumHeader = ({ userName, onLogout, onOpenCreateModal }) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      className="premium-header glass-dark"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-container">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-lg bg-gradient-animated flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Link2 size={20} style={{ color: 'white' }} />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">LinkVault</h1>
            <p className="text-xs text-text-tertiary">Premium Edition</p>
          </div>
        </div>

        {/* Command Palette Trigger */}
        <motion.div
          className="flex-1 mx-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="relative w-full max-w-md"
            onClick={() => setShowCommandPalette(true)}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder="Search links... (Ctrl+K)"
              className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary-500 cursor-pointer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              readOnly
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
              ⌘K
            </span>
          </div>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </motion.button>

          <Button variant="primary" size="sm" onClick={onOpenCreateModal} className="flex items-center gap-2">
            <Plus size={18} /> New Link
          </Button>

          <motion.div
            className="relative group"
            whileHover={{ scale: 1.05 }}
          >
            <button className="p-2 hover:bg-bg-tertiary rounded-lg transition">
              <Bell size={20} className="text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
          </motion.div>

          <div className="h-8 w-px bg-border"></div>

          <motion.div className="relative group">
            <button className="flex items-center gap-2 p-2 hover:bg-bg-tertiary rounded-lg transition">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <User size={16} className="text-primary-500" />
              </div>
              <ChevronDown size={16} className="text-text-tertiary" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-lg shadow-xl z-50">
              <a href="#profile" className="flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary transition">
                <User size={16} /> Profile
              </a>
              <a href="#settings" className="flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary transition">
                <Settings size={16} /> Settings
              </a>
              <div className="border-t border-border my-2"></div>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary transition text-error">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

/* ====================================
   STATS CARD WITH ANIMATION
   ==================================== */

const StatCard = ({ icon: Icon, label, value, change, suffix = '', index = 0 }) => {
  const [ref, isVisible] = useAnimationOnScroll({ threshold: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      className="card group"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-tertiary text-sm font-medium mb-2">{label}</p>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-3xl font-bold text-text-primary">
              {typeof value === 'number' ? value.toLocaleString() : value}
              <span className="text-lg ml-1 text-text-secondary">{suffix}</span>
            </h3>
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-medium ${change > 0 ? 'text-success' : 'text-error'}`}>
              <TrendingUp size={14} style={{ transform: change < 0 ? 'rotate(180deg)' : 'none' }} />
              {Math.abs(change)}% vs last week
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary-500/10 text-primary-500 group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

/* ====================================
   QUICK ACTIONS PANEL
   ==================================== */

const QuickActionsPanel = () => {
  const [ref, isVisible] = useAnimationOnScroll({ threshold: 0.2, once: true });

  const actions = [
    { icon: Link2, label: 'Create Link', color: '#6366f1' },
    { icon: BarChart3, label: 'View Analytics', color: '#0ea5e9' },
    { icon: Download, label: 'Export Data', color: '#10b981' },
    { icon: Share2, label: 'Share Link', color: '#f472b6' },
  ];

  return (
    <motion.div
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            className="flex items-center gap-2 p-3 rounded-lg bg-bg-tertiary hover:bg-primary-500/10 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <action.icon size={18} style={{ color: action.color }} />
            <span className="text-sm font-medium text-text-secondary">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

/* ====================================
   RECENT LINKS WIDGET
   ==================================== */

const RecentLinksWidget = ({ links = [] }) => {
  const [ref, isVisible] = useAnimationOnScroll({ threshold: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Recent Links</h3>
        <Button variant="ghost" size="sm">View All</Button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No links yet"
          description="Create your first link to get started"
          action={<Button variant="primary" size="sm">Create Link</Button>}
        />
      ) : (
        <div className="space-y-3">
          {links.slice(0, 5).map((link, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary hover:bg-bg-secondary transition group cursor-pointer"
              whileHover={{ x: 4 }}
            >
              <div className="flex-1">
                <p className="text-text-primary font-medium truncate">{link.title}</p>
                <p className="text-text-tertiary text-sm">linkvault.io/{link.shortCode}</p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-text-primary font-semibold">{link.clicks}</p>
                  <p className="text-text-tertiary text-xs">clicks</p>
                </div>
                <MoreHorizontal size={18} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ====================================
   ANALYTICS CHART PLACEHOLDER
   ==================================== */

const AnalyticsChart = () => {
  const [ref, isVisible] = useAnimationOnScroll({ threshold: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      className="card col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Performance Summary</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">7d</Button>
          <Button variant="secondary" size="sm">30d</Button>
          <Button variant="ghost" size="sm">90d</Button>
        </div>
      </div>

      {/* Placeholder Chart */}
      <div className="h-64 bg-gradient-animated rounded-lg opacity-30 flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
          <p>Chart loading...</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ====================================
   MAIN PREMIUM DASHBOARD
   ==================================== */

const PremiumDashboard = () => {
  const [links, setLinks] = useLocalStorage('userLinks', []);
  const [userName] = useLocalStorage('userName', 'User');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  // Mock data
  const stats = [
    { icon: Link2, label: 'Total Links', value: links.length, change: 12 },
    { icon: MousePointerClick, label: 'Total Clicks', value: 12450, change: 8 },
    { icon: TrendingUp, label: 'Avg CTR', value: 14.5, suffix: '%', change: 2 },
    { icon: Globe, label: 'Countries', value: 48, change: 5 },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <PremiumHeader
        userName={userName}
        onLogout={handleLogout}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">Welcome back, {userName}!</h1>
          <p className="text-text-secondary">Here's what's happening with your links today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} index={i} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsChart />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <QuickActionsPanel />
            <RecentLinksWidget links={links} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumDashboard;
