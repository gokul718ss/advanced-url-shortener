/**
 * Authentication Controller
 * Handles user registration, login, profile management
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendError(res, 409, 'An account with this email already exists. Please log in.');
  }

  // Create new user
  const user = await User.create({ name, email, password });

  // Generate token
  const token = generateToken(user._id);

  logger.info(`New user registered: ${email}`);

  return sendSuccess(res, 201, 'Account created successfully! Welcome aboard.', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return sendError(res, 401, 'Invalid email or password. Please check your credentials.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return sendError(res, 401, 'Invalid email or password. Please check your credentials.');
  }

  // Check if account is active
  if (!user.isActive) {
    return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user._id);

  logger.info(`User logged in: ${email}`);

  return sendSuccess(res, 200, 'Login successful! Welcome back.', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    token,
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('urlCount');

  return sendSuccess(res, 200, 'Profile fetched successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      urlCount: user.urlCount || 0,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updateData = {};

  if (name) updateData.name = name;

  // Handle profile image upload
  if (req.file) {
    updateData.profileImage = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 200, 'Profile updated successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    },
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return sendError(res, 401, 'Current password is incorrect.');
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return sendError(res, 400, 'New password must be at least 8 characters long.');
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);

  return sendSuccess(res, 200, 'Password updated successfully.', { token });
});

/**
 * @desc    Verify token validity
 * @route   GET /api/auth/verify
 * @access  Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Token is valid', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage,
      role: req.user.role,
    },
  });
});

module.exports = { register, login, getProfile, updateProfile, updatePassword, verifyToken };
