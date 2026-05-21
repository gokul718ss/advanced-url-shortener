import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Globe, Link2, MousePointerClick, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { urlService } from '../services/api';
import '../styles/dashboard-reborn.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentLinks, setRecentLinks] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, linksRes] = await Promise.all([
          urlService.getDashboardStats(),
          urlService.getAllUrls({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);
        setStats(statsRes.data?.data?.stats || {});
        setRecentLinks(linksRes.data?.data || []);
      } catch {
        setStats({});
        setRecentLinks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const tiles = useMemo(() => {
    const safe = stats || {};
    return [
      { icon: Link2, label: 'Managed Links', value: safe.totalUrls || 0 },
      { icon: MousePointerClick, label: 'Total Clicks', value: safe.totalClicks || 0 },
      { icon: Globe, label: 'Active Links', value: safe.activeLinks || 0 },
      { icon: TrendingUp, label: 'Expired Links', value: safe.expiredLinks || 0 },
    ];
  }, [stats]);

  return (
    <div className="reborn-dashboard">
      <section className="reborn-hero">
        <div>
          <span className="reborn-badge"><Sparkles size={14} /> Command Center</span>
          <h1>Performance cockpit for global URL campaigns</h1>
          <p>
            Monitor link health, conversion momentum, and campaign traffic from one operational surface.
          </p>
        </div>
        <div className="reborn-actions">
          <button className="btn btn-primary btn-md" onClick={() => navigate('/dashboard/create')}>
            <Plus size={16} /> New Link
          </button>
          <button className="btn btn-secondary btn-md" onClick={() => navigate('/dashboard/links')}>
            <BarChart3 size={16} /> View All Links
          </button>
        </div>
      </section>

      <section className="reborn-grid">
        {tiles.map((tile, i) => (
          <motion.article
            key={tile.label}
            className="reborn-tile"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="tile-icon"><tile.icon size={18} /></div>
            <h3>{tile.label}</h3>
            <strong>{loading ? '...' : typeof tile.value === 'number' ? tile.value.toLocaleString() : tile.value}</strong>
          </motion.article>
        ))}
      </section>

      <section className="reborn-panels">
        <article className="reborn-panel reborn-panel-main">
          <header>
            <h2>Live Activity Overview</h2>
            <span>Last 30 days</span>
          </header>
          <div className="activity-graph" />
          <div className="activity-footer">
            <div><span>Top Channel</span><strong>Organic Search</strong></div>
            <div><span>Best Hour</span><strong>19:00 - 20:00</strong></div>
            <div><span>Bounce Risk</span><strong className="ok">Low</strong></div>
          </div>
        </article>

        <article className="reborn-panel">
          <header>
            <h2>Recent Links</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/links')}>See More</button>
          </header>
          <div className="recent-list">
            {recentLinks.length === 0 && (
              <p className="muted">{loading ? 'Loading latest links...' : 'No links found yet.'}</p>
            )}
            {recentLinks.map((link) => (
              <button
                key={link._id}
                className="recent-item"
                onClick={() => navigate(`/dashboard/analytics/${link.shortCode}`)}
              >
                <div>
                  <strong>{link.title || link.shortCode}</strong>
                  <span>{link.shortUrl}</span>
                </div>
                <b>{(link.clickCount || 0).toLocaleString()} clicks</b>
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
