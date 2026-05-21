/**
 * URL Utility Functions
 * Helpers for URL validation, short code generation, and QR code creation
 */

const { customAlphabet } = require('nanoid');
const QRCode = require('qrcode');
const logger = require('./logger');

// Custom alphabet for generating short codes (URL-safe characters)
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 7);

/**
 * Generate a unique short code
 * @param {number} length - Length of the short code (default: 7)
 * @returns {string} Generated short code
 */
const generateShortCode = (length = 7) => {
  return nanoid(length);
};

/**
 * Validate if a string is a valid URL
 * @param {string} url - URL string to validate
 * @returns {boolean} True if valid URL
 */
const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize and normalize a URL
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
const sanitizeUrl = (url) => {
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
};

/**
 * Generate a QR code as a base64 data URL
 * @param {string} url - URL to encode in QR code
 * @returns {Promise<string>} Base64 encoded QR code image
 */
const generateQRCode = async (url) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('QR code generation failed:', error);
    return null;
  }
};

/**
 * Validate custom alias format
 * @param {string} alias - Custom alias to validate
 * @returns {boolean} True if valid alias
 */
const isValidAlias = (alias) => {
  // Only allow alphanumeric characters, hyphens, and underscores
  const aliasRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return aliasRegex.test(alias);
};

/**
 * Check if a URL has expired
 * @param {Date} expiryDate - Expiry date
 * @returns {boolean} True if expired
 */
const isUrlExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
};

/**
 * Format bytes to human-readable size
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports = {
  generateShortCode,
  isValidUrl,
  sanitizeUrl,
  generateQRCode,
  isValidAlias,
  isUrlExpired,
  formatBytes,
};
