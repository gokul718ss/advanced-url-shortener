/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. Please log in to continue.');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Session expired. Please log in again.');
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token. Please log in again.');
      }
      return sendError(res, 401, 'Token verification failed.');
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    // Check if account is active
    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    // Check if password changed after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
      return sendError(res, 401, 'Password recently changed. Please log in again.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return sendError(res, 500, 'Authentication error. Please try again.');
  }
};

/**
 * Restrict routes to specific roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
};

/**
 * Optional auth - attaches user if token provided but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch {
        // Token invalid, continue without user
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, restrictTo, optionalAuth };
