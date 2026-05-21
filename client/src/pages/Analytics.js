import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { ClipLoader } from 'react-spinners';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell,
} from 'recharts';
import {
  ArrowLeft, MousePointerClick, Activity, Globe, Monitor, Smartphone, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { urlService } from '../services/api';
import '../styles/analytics-premium.css';

const chartColors = ['#818cf8', '#22d3ee', '#f472b6', '#34d399', '#f59e0b'];

const Analytics = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    if (!shortCode) return;
    setLoading(true);
    try {
      const res = await urlService.getAnalytics(shortCode);
      setData(res.data?.data?.analytics || null);
    } catch {
      toast.error('Unable to load analytics');
      navigate('/dashboard/links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [shortCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const dailyData = useMemo(() => {
    if (!data?.dailyClicks) return [];
    return Object.entries(data.dailyClicks).map(([date, clicks]) => ({
      day: format(parseISO(date), 'MMM d'),
      clicks,
    })).slice(-14);
  }, [data]);

  const referrerData = useMemo(() => {
    if (!data?.referrers) return [];
    return Object.entries(data.referrers).map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [data]);

  const deviceData = useMemo(() => {
    if (!data?.devices) return [];
    return Object.entries(data.devices).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <ClipLoader size={46} color="#818cf8" />
        <p>Building realtime analytics narrative...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="analytics-premium">
      <section className="analytics-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/links')}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1>Advanced Link Intelligence</h1>
          <p>{data.urlInfo?.shortUrl}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </section>

      <section className="analytics-kpis">
        {[
          { icon: MousePointerClick, label: 'Total Clicks', value: data.overview?.totalClicks || 0 },
          { icon: Activity, label: 'Active Days', value: data.overview?.uniqueDays || 0 },
          { icon: Globe, label: 'Top Country', value: data.overview?.topCountry || 'N/A' },
          { icon: Monitor, label: 'Top Device', value: deviceData[0]?.name || 'N/A' },
        ].map((item) => (
          <article key={item.label} className="analytics-kpi">
            <item.icon size={17} />
            <h3>{item.label}</h3>
            <strong>{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</strong>
          </article>
        ))}
      </section>

      <section className="analytics-grid">
        <article className="analytics-card analytics-card-wide">
          <header>
            <h2>Engagement Timeline</h2>
          </header>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={2.8} fill="url(#clickGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-card">
          <header><h2>Referrer Quality</h2></header>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={referrerData}>
                <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                <XAxis dataKey="source" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {referrerData.map((item, idx) => (
                    <Cell key={item.source} fill={chartColors[idx % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-card">
          <header><h2>Device Mix</h2></header>
          <div className="device-list">
            {deviceData.map((d, i) => (
              <div key={d.name} className="device-item">
                <span className={clsx('dot', `color-${i % 5}`)} />
                <p>{d.name}</p>
                <strong>{d.value}</strong>
              </div>
            ))}
            {deviceData.length === 0 && <p className="muted">No device data</p>}
          </div>
          <div className="device-footer">
            <Smartphone size={14} />
            <span>Mobile-first optimization recommended for this traffic profile.</span>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Analytics;
