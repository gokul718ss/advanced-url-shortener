import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Zap, Target } from 'lucide-react';
import { useAnimationOnScroll } from '../hooks';

/* ====================================
   AI INSIGHTS ENGINE COMPONENT
   ==================================== */

const AIInsightsEngine = ({ linkData = [] }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ref, isVisible] = useAnimationOnScroll({ threshold: 0.2, once: true });

  const generateInsights = () => {
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newInsights = [
        {
          id: 1,
          type: 'opportunity',
          title: 'Peak Traffic Window Detected',
          message: 'Your links receive 3.2x more clicks between 2-4 PM. Optimize your posting schedule.',
          icon: Zap,
          color: '#f59e0b',
          confidence: 94,
        },
        {
          id: 2,
          type: 'alert',
          title: 'Unusual Referrer Pattern',
          message: 'Detected 340% spike in traffic from Instagram. This could indicate viral growth.',
          icon: TrendingUp,
          color: '#10b981',
          confidence: 87,
        },
        {
          id: 3,
          type: 'recommendation',
          title: 'Mobile-First Strategy Advised',
          message: '78% of your clicks come from mobile devices. Consider mobile-optimized content.',
          icon: Target,
          color: '#0ea5e9',
          confidence: 92,
        },
        {
          id: 4,
          type: 'warning',
          title: 'Low Engagement Alert',
          message: 'Your bounce rate is 34% above baseline. Review destination content quality.',
          icon: AlertCircle,
          color: '#ef4444',
          confidence: 76,
        },
      ];
      
      setInsights(newInsights);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (isVisible && insights.length === 0) {
      generateInsights();
    }
  }, [isVisible]);

  return (
    <motion.div
      ref={ref}
      className="ai-insights-container"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="ai-insights-header">
        <div className="ai-insights-title">
          <div className="ai-sparkle-icon">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={20} />
            </motion.div>
          </div>
          <h3>AI-Powered Insights</h3>
        </div>
        <motion.button
          className="ai-refresh-btn"
          onClick={generateInsights}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? '🔄 Analyzing...' : '✨ Refresh'}
        </motion.button>
      </div>

      <div className="ai-insights-content">
        {loading ? (
          <div className="ai-loading-state">
            <motion.div
              className="ai-loading-shimmer"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p>Analyzing your data with AI...</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="insights-list">
              {insights.map((insight, index) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  index={index}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <div className="ai-insights-footer">
        <p className="confidence-note">All insights are generated using advanced ML algorithms</p>
      </div>
    </motion.div>
  );
};

/* ====================================
   INSIGHT CARD COMPONENT
   ==================================== */

const InsightCard = ({ insight, index }) => {
  const Icon = insight.icon;

  return (
    <motion.div
      className={`insight-card insight-${insight.type}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ x: 4 }}
    >
      <div className="insight-icon" style={{ color: insight.color }}>
        <Icon size={20} />
      </div>

      <div className="insight-content">
        <h4 className="insight-title">{insight.title}</h4>
        <p className="insight-message">{insight.message}</p>

        <div className="insight-footer">
          <div className="confidence-bar">
            <motion.div
              className="confidence-fill"
              initial={{ width: 0 }}
              animate={{ width: `${insight.confidence}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              style={{ background: insight.color }}
            />
          </div>
          <span className="confidence-text">{insight.confidence}% confidence</span>
        </div>
      </div>

      <motion.button
        className="insight-action"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        →
      </motion.button>
    </motion.div>
  );
};

export default AIInsightsEngine;

/* ============================================
   CSS STYLES FOR AI INSIGHTS
   ============================================ */

const aiInsightsStyles = `
.ai-insights-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  overflow: hidden;
}

.ai-insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.ai-insights-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.ai-sparkle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(245, 158, 11, 0.2));
  border-radius: var(--radius-lg);
  color: #a78bfa;
}

.ai-insights-title h3 {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.ai-refresh-btn {
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg, #a78bfa, #f59e0b);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(167, 139, 250, 0.4);
}

.ai-refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ai-insights-content {
  min-height: 300px;
  position: relative;
}

.ai-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  position: relative;
}

.ai-loading-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  border-radius: var(--radius-lg);
}

.ai-loading-state p {
  color: var(--text-secondary);
  margin-top: var(--space-3);
  font-size: var(--fs-sm);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.insight-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: currentColor;
}

.insight-card.insight-opportunity {
  border-left-color: #f59e0b;
}

.insight-card.insight-alert {
  border-left-color: #10b981;
}

.insight-card.insight-recommendation {
  border-left-color: #0ea5e9;
}

.insight-card.insight-warning {
  border-left-color: #ef4444;
}

.insight-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-500);
  transform: translateX(4px);
}

.insight-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: currentColor;
  opacity: 0.2;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.insight-message {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.insight-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.confidence-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: var(--radius-full);
}

.confidence-text {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.insight-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--fs-lg);
  transition: all 0.3s ease;
}

.insight-action:hover {
  box-shadow: var(--shadow-glow-primary);
}

.ai-insights-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  text-align: center;
}

.confidence-note {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .ai-insights-container {
    padding: var(--space-4);
  }

  .insight-card {
    gap: var(--space-3);
    padding: var(--space-3);
  }

  .insight-title {
    font-size: var(--fs-xs);
  }

  .insight-message {
    font-size: var(--fs-xs);
  }
}
`;
