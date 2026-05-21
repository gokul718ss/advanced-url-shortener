/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass to Express error handler
 */

/**
 * Wraps an async function to catch any unhandled promise rejections
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
