import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Link2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errs.password = 'Must contain uppercase, lowercase, and number';
    }
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
    });

    if (result.success) navigate('/dashboard');
  };

  const features = [
    { icon: '🔗', title: 'Smart URL Shortening', desc: 'With custom aliases and expiry dates' },
    { icon: '📊', title: 'Real-time Analytics', desc: 'Clicks, devices, countries, and more' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'JWT auth and encrypted storage' },
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
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Link2 size={20} color="white" />
            </div>
            <span className="auth-logo-text">LinkVault</span>
          </div>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join thousands of users managing their links smarter</p>

          {/* Error Alert */}
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
            {/* Name */}
            <div>
              <div className="auth-input-group">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`auth-input ${errors.name ? 'error' : ''}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="form-error" style={{ marginTop: 4 }}><AlertCircle size={12} />{errors.name}</p>}
            </div>

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
                  placeholder="Password (min. 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error" style={{ marginTop: 4 }}><AlertCircle size={12} />{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="auth-input-group">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="form-error" style={{ marginTop: 4 }}><AlertCircle size={12} />{errors.confirmPassword}</p>}
            </div>

            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <><div className="spinner" /><span>Creating Account...</span></>
              ) : (
                <><span>Create Account</span><ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="auth-switch" style={{ marginTop: 'var(--spacing-lg)' }}>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-features">
          <h2 className="auth-features-title">
            Everything you need to{' '}
            <span className="text-gradient">manage your links</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Join LinkVault and get access to professional URL management tools.
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

export default RegisterPage;
