import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, BarChart3, Shield, Zap, Globe, QrCode, ArrowRight } from 'lucide-react';
import '../styles/landing-modern.css';

const features = [
  { icon: Zap, title: 'Instant Provisioning', desc: 'Generate short links in milliseconds with distributed edge handling.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Track traffic, geographies, and device quality in one operational view.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Role controls, abuse protection, and secure redirect infrastructure.' },
  { icon: QrCode, title: 'Dynamic QR', desc: 'Attach QR campaigns to links and update destinations without reprinting.' },
  { icon: Globe, title: 'Geo Routing', desc: 'Send users to localized destinations for better relevance and conversion.' },
  { icon: Link2, title: 'Branded Domains', desc: 'Strengthen trust and click-through with your own domain strategy.' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-modern">
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="landing-brand-icon"><Link2 size={16} /></span>
          <span>LinkVault</span>
        </div>
        <nav className="landing-links">
          <a href="#platform">Platform</a>
          <a href="#features">Features</a>
          <a href="#trust">Trust</a>
        </nav>
        <div className="landing-nav-actions">
          <Link to="/login"><button className="btn btn-ghost btn-sm">Log In</button></Link>
          <Link to="/register"><button className="btn btn-primary btn-sm">Get Started</button></Link>
        </div>
      </header>

      <section id="platform" className="hero-modern">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hero-copy"
        >
          <span className="landing-pill">Built for high-performance marketing teams</span>
          <h1>Global-ready <span className="text-gradient">link operations</span> in one platform</h1>
          <p>
            LinkVault gives product, growth, and performance teams a production-grade URL platform with
            analytics visibility, governance, and speed.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Open Dashboard
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-preview card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
        >
          <div className="preview-head" />
          <div className="preview-stats">
            <span />
            <span />
            <span />
          </div>
          <div className="preview-chart" />
        </motion.div>
      </section>

      <section id="features" className="landing-section">
        <div className="section-head">
          <h2>Made for global market execution</h2>
          <p>Production reliability, data clarity, and premium brand control.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="feature-card"
            >
              <feature.icon size={20} />
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="trust" className="trust-strip">
        <div className="trust-item"><Zap size={16} /> 99.99% uptime target</div>
        <div className="trust-item"><Shield size={16} /> Security-first architecture</div>
        <div className="trust-item"><Globe size={16} /> Multi-region delivery</div>
      </section>

      <footer className="landing-footer">
        <p>LinkVault • Enterprise URL Platform</p>
        <button className="btn btn-primary btn-md" onClick={() => navigate('/register')}>
          Create Account
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;
