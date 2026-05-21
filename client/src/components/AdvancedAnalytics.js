import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, Download, Share2, Settings } from 'lucide-react';
import { useAnimationOnScroll } from '../hooks';

/* ====================================
   SAMPLE DATA GENERATORS
   ==================================== */

const generateChartData = () => {
  return [
    { date: 'Mon', clicks: 2400, impressions: 2210, ctr: 9.6 },
    { date: 'Tue', clicks: 1398, impressions: 2290, ctr: 6.1 },
    { date: 'Wed', clicks: 9800, impressions: 2000, ctr: 49 },
    { date: 'Thu', clicks: 3908, impressions: 2108, ctr: 18.5 },
    { date: 'Fri', clicks: 4800, impressions: 2276, ctr: 21.1 },
    { date: 'Sat', clicks: 3800, impressions: 2250, ctr: 16.9 },
    { date: 'Sun', clicks: 4300, impressions: 2210, ctr: 19.4 },
  ];
};

const generateDeviceData = () => {
  return [
    { name: 'Mobile', value: 62, color: '#0ea5e9' },
    { name: 'Desktop', value: 28, color: '#10b981' },
    { name: 'Tablet', value: 10, color: '#f59e0b' },
  ];
};

const generateGeoData = () => {
  return [
    { country: 'USA', clicks: 3200 },
    { country: 'India', clicks: 2800 },
    { country: 'UK', clicks: 2400 },
    { country: 'Canada', clicks: 1800 },
    { country: 'Germany', clicks: 1400 },
  ];
};

/* ====================================
   ADVANCED ANALYTICS COMPONENT
   ==================================== */

const AdvancedAnalytics = () => {
  const [ref, isVisible] = useAnimationOnScroll({ threshold: 0.2, once: true });
  const [timeRange, setTimeRange] = useState('7d');
  const [activeChart, setActiveChart] = useState('performance');

  const [chartData] = useState(generateChartData());
  const [deviceData] = useState(generateDeviceData());
  const [geoData] = useState(generateGeoData());

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className="advanced-analytics"
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Advanced Analytics</h2>
          <p className="analytics-subtitle">Deep dive into your link performance metrics</p>
        </div>

        <div className="analytics-controls">
          <div className="time-range-selector">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                className={`range-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="analytics-action-btn">
            <Download size={18} />
          </button>
          <button className="analytics-action-btn">
            <Share2 size={18} />
          </button>
          <button className="analytics-action-btn">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="chart-type-selector">
        {[
          { id: 'performance', label: 'Performance', icon: '📈' },
          { id: 'device', label: 'Device', icon: '📱' },
          { id: 'geo', label: 'Geography', icon: '🌍' },
        ].map(chart => (
          <motion.button
            key={chart.id}
            className={`chart-type-btn ${activeChart === chart.id ? 'active' : ''}`}
            onClick={() => setActiveChart(chart.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="chart-icon">{chart.icon}</span>
            {chart.label}
          </motion.button>
        ))}
      </div>

      {/* Charts */}
      <motion.div
        className="charts-container"
        variants={chartVariants}
        animate={isVisible ? 'visible' : 'hidden'}
        transition={{ delay: 0.2 }}
      >
        {activeChart === 'performance' && (
          <motion.div
            className="chart-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="chart-subtitle">Click Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" />
                <YAxis stroke="var(--text-tertiary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Secondary metric */}
            <div className="secondary-chart">
              <h3 className="chart-subtitle">CTR Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" />
                  <YAxis stroke="var(--text-tertiary)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ctr"
                    stroke="#0ea5e9"
                    dot={{ fill: '#0ea5e9' }}
                    name="CTR %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeChart === 'device' && (
          <motion.div
            className="chart-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="chart-subtitle">Clicks by Device Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Device stats */}
            <div className="device-stats">
              {deviceData.map((device, i) => (
                <motion.div
                  key={i}
                  className="device-stat-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div
                    className="device-color"
                    style={{ backgroundColor: device.color }}
                  />
                  <div className="device-info">
                    <p className="device-name">{device.name}</p>
                    <p className="device-percentage">{device.value}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeChart === 'geo' && (
          <motion.div
            className="chart-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="chart-subtitle">Top Countries</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={geoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="country" stroke="var(--text-tertiary)" />
                <YAxis stroke="var(--text-tertiary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar
                  dataKey="clicks"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  name="Clicks"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Geo table */}
            <div className="geo-table">
              <div className="table-header">
                <div className="table-cell">Country</div>
                <div className="table-cell">Clicks</div>
                <div className="table-cell">%</div>
              </div>
              {geoData.map((item, i) => (
                <div key={i} className="table-row">
                  <div className="table-cell">{item.country}</div>
                  <div className="table-cell">{item.clicks.toLocaleString()}</div>
                  <div className="table-cell">
                    {(
                      (item.clicks /
                        geoData.reduce((sum, d) => sum + d.clicks, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdvancedAnalytics;
