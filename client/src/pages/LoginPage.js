import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Link2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';
  const sessionExpired = new URLSearchParams(location.search).get('session') === 'expired';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const result = await login({ email: formData.email, password: formData.password });
    if (result.success) navigate(from, { replace: true });
  };

  const features = [
    { icon: '⚡', title: 'Lightning Fast Redirects', desc: 'Sub-100ms redirect performance globally' },
    { icon: '📈', title: 'Advanced Analytics', desc: 'Real-time click tracking and visitor insights' },
    { icon: '🎯', title: 'Custom Short Links', desc: 'Create branded aliases for your URLs' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Link2 size={20} color="white" />
            </div>
            <span className="auth-logo-text">LinkVault</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to access your dashboard and analytics</p>

          {/* Session expired warning */}
          {sessionExpired && (
            <motion.div
              className="auth-error-msg"
              style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)', color: 'var(--color-warning)' }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              Your session expired. Please sign in again.
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              className="auth-error-msg"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <div className="auth-input-group">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`auth-input ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <p className="form-error" style={{ marginTop: 4 }}><AlertCircle size={12} />{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="auth-input-group">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error" style={{ marginTop: 4 }}><AlertCircle size={12} />{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <><div className="spinner" /><span>Signing in...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="auth-switch" style={{ marginTop: 'var(--spacing-lg)' }}>
            Don't have an account?{' '}
            <Link to="/register">Create one for free</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-features">
          <h2 className="auth-features-title">
            The smarter way to{' '}
            <span className="text-gradient">manage your links</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Professional URL management with powerful analytics for teams of all sizes.
          </p>

          <div className="auth-features-list">
            {features.map((f) => (
              <motion.div
                key={f.title}
                className="auth-feature-item"
                whileHover={{ x: 6 }}
              >
                <div className="auth-feature-icon">
                  <span style={{ fontSize: '1.25rem' }}>{f.icon}</span>
                </div>
                <div className="auth-feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
