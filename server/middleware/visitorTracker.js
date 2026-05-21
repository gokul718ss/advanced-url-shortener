/**
 * Visitor Tracking Middleware
 * Extracts browser, device, OS, and location information from requests
 */

const UAParser = require('ua-parser-js');

/**
 * Parse user agent and extract visitor information
 */
const extractVisitorInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent'] || '');
  const result = parser.getResult();

  // Get browser info
  const browser = result.browser.name || 'Unknown';
  const browserVersion = result.browser.version || 'Unknown';

  // Get OS info
  const os = result.os.name || 'Unknown';
  const osVersion = result.os.version || 'Unknown';

  // Determine device type
  let device = 'Desktop';
  if (result.device.type === 'mobile') device = 'Mobile';
  else if (result.device.type === 'tablet') device = 'Tablet';
  else if (!result.device.type && result.ua) {
    // Additional mobile detection
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    if (mobileRegex.test(result.ua.toLowerCase())) device = 'Mobile';
  }

  // Get referrer
  const referrer = req.headers.referer || req.headers.referrer || 'Direct';

  // Get IP address (handle proxies)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'Unknown';

  return {
    browser,
    browserVersion,
    device,
    os,
    osVersion,
    referrer: referrer === 'Direct' ? 'Direct' : (() => { try { return new URL(referrer).hostname; } catch { return 'Direct'; } })(),
    ip,
    country: 'Unknown', // Would need a GeoIP service for real location
    city: 'Unknown',
    userAgent: req.headers['user-agent'] || 'Unknown',
    timestamp: new Date(),
  };
};

module.exports = { extractVisitorInfo };
