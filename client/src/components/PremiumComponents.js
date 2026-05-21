import React from 'react';
import { motion } from 'framer-motion';
import '../styles/components-library.css';

/* ====================================
   BUTTON COMPONENTS - PREMIUM VARIANTS
   ==================================== */

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  whileHover = { scale: 1.02 },
  whileTap = { scale: 0.98 },
  ...props 
}) => {
  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      whileHover={!disabled && whileHover}
      whileTap={!disabled && whileTap}
      {...props}
    >
      {loading ? (
        <svg className="btn-spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

/* ====================================
   CARD COMPONENTS - FLOATING DESIGN
   ==================================== */

export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

/* ====================================
   INPUT COMPONENTS - PREMIUM STYLING
   ==================================== */

export const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {Icon && <Icon className="input-icon" size={20} />}
        <input
          ref={ref}
          className={`input-field ${error ? 'input-error' : ''} ${Icon ? 'input-with-icon' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

/* ====================================
   BADGE COMPONENTS
   ==================================== */

export const Badge = ({ children, variant = 'primary', size = 'sm' }) => (
  <span className={`badge badge-${variant} badge-${size}`}>
    {children}
  </span>
);

/* ====================================
   MODAL / DIALOG COMPONENTS
   ==================================== */

export const Modal = ({ isOpen, onClose, children, title, className = '' }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`modal-content ${className}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ====================================
   LOADING SKELETON COMPONENTS
   ==================================== */

export const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
  <div
    className={`skeleton-loader ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <SkeletonLoader height="200px" className="mb-4" />
    <SkeletonLoader height="20px" width="80%" className="mb-2" />
    <SkeletonLoader height="16px" width="60%" />
  </div>
);

/* ====================================
   TOAST / NOTIFICATION COMPONENTS
   ==================================== */

export const Toast = ({ message, type = 'info', onClose }) => (
  <motion.div
    className={`toast toast-${type}`}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layout
  >
    <span>{message}</span>
    <button onClick={onClose}>×</button>
  </motion.div>
);

/* ====================================
   FLOATING ACTION BUTTON
   ==================================== */

export const FloatingActionButton = ({ Icon, onClick, className = '' }) => (
  <motion.button
    className={`fab ${className}`}
    whileHover={{ scale: 1.1, rotate: 90 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
  >
    <Icon size={24} />
  </motion.button>
);

/* ====================================
   ANIMATED COUNTER
   ==================================== */

export const AnimatedCounter = ({ value = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let animation;
    const duration = 1000;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(Math.floor(value * progress));

      if (progress < 1) {
        animation = requestAnimationFrame(animate);
      }
    };

    animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

/* ====================================
   PREMIUM DROPDOWN / SELECT
   ==================================== */

export const Select = React.forwardRef(({ 
  label, 
  options = [],
  value,
  onChange,
  error,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="select-wrapper">
      {label && <label className="select-label">{label}</label>}
      <select
        ref={ref}
        className={`select-field ${error ? 'select-error' : ''} ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

/* ====================================
   TOGGLE / SWITCH COMPONENT
   ==================================== */

export const Toggle = ({ checked, onChange }) => (
  <motion.button
    className={`toggle ${checked ? 'toggle-on' : 'toggle-off'}`}
    onClick={() => onChange(!checked)}
  >
    <motion.div
      className="toggle-handle"
      layout
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    />
  </motion.button>
);

/* ====================================
   PROGRESS BAR COMPONENT
   ==================================== */

export const ProgressBar = ({ value = 0, max = 100, variant = 'primary' }) => (
  <div className="progress-container">
    <motion.div
      className={`progress-bar progress-${variant}`}
      initial={{ width: 0 }}
      animate={{ width: `${(value / max) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

/* ====================================
   GRADIENT TEXT COMPONENT
   ==================================== */

export const GradientText = ({ children, className = '', direction = 'to right' }) => (
  <span className={`gradient-text gradient-text-${direction} ${className}`}>
    {children}
  </span>
);

/* ====================================
   ICON BUTTON
   ==================================== */

export const IconButton = ({ Icon, onClick, title = '', variant = 'ghost', size = 'md' }) => (
  <motion.button
    className={`icon-btn icon-btn-${variant} icon-btn-${size}`}
    onClick={onClick}
    title={title}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
  </motion.button>
);

/* ====================================
   PILL / TAG COMPONENT
   ==================================== */

export const Pill = ({ children, onRemove, variant = 'primary' }) => (
  <motion.div
    className={`pill pill-${variant}`}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
  >
    <span>{children}</span>
    {onRemove && (
      <button className="pill-close" onClick={onRemove}>×</button>
    )}
  </motion.div>
);

/* ====================================
   DIVIDER COMPONENT
   ==================================== */

export const Divider = ({ text = '', className = '' }) => (
  <div className={`divider ${className}`}>
    {text && <span className="divider-text">{text}</span>}
  </div>
);

/* ====================================
   EMPTY STATE COMPONENT
   ==================================== */

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}) => (
  <motion.div
    className={`empty-state ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {Icon && <Icon size={48} className="empty-state-icon" />}
    {title && <h3 className="empty-state-title">{title}</h3>}
    {description && <p className="empty-state-description">{description}</p>}
    {action && <div className="empty-state-action">{action}</div>}
  </motion.div>
);

/* ====================================
   TOOLTIP COMPONENT
   ==================================== */

export const Tooltip = ({ content, children, position = 'top' }) => (
  <div className={`tooltip-wrapper tooltip-${position}`}>
    {children}
    <div className="tooltip-content">{content}</div>
  </div>
);

export default {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Badge,
  Modal,
  SkeletonLoader,
  SkeletonCard,
  Toast,
  FloatingActionButton,
  AnimatedCounter,
  Select,
  Toggle,
  ProgressBar,
  GradientText,
  IconButton,
  Pill,
  Divider,
  EmptyState,
  Tooltip,
};
