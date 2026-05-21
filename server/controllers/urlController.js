/**
 * URL Controller
 * Handles URL creation, management, analytics, and redirect logic
 */

const Url = require('../models/Url');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { generateShortCode, isValidUrl, sanitizeUrl, generateQRCode, isValidAlias } = require('../utils/urlHelpers');
const { extractVisitorInfo } = require('../middleware/visitorTracker');
const logger = require('../utils/logger');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

/**
 * @desc    Create a shortened URL
 * @route   POST /api/url/create
 * @access  Private
 */
const createUrl = asyncHandler(async (req, res) => {
  let { originalUrl, customAlias, expiryDate, title, tags, generateQR } = req.body;

  // Sanitize and validate URL
  originalUrl = sanitizeUrl(originalUrl);
  if (!isValidUrl(originalUrl)) {
    return sendError(res, 400, 'Please provide a valid URL starting with http:// or https://');
  }

  let shortCode;

  // Handle custom alias
  if (customAlias) {
    customAlias = customAlias.toLowerCase().trim();

    if (!isValidAlias(customAlias)) {
      return sendError(res, 400, 'Custom alias can only contain letters, numbers, hyphens, and underscores (3-30 chars)');
    }

    // Check if alias is already taken
    const existingAlias = await Url.findOne({ shortCode: customAlias });
    if (existingAlias) {
      return sendError(res, 409, `The alias "${customAlias}" is already taken. Please choose a different one.`);
    }

    shortCode = customAlias;
  } else {
    // Generate unique short code
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      shortCode = generateShortCode(7);
      const existing = await Url.findOne({ shortCode });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return sendError(res, 500, 'Could not generate a unique short code. Please try again.');
    }
  }

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const shortUrl = `${baseUrl}/${shortCode}`;

  // Generate QR code if requested
  let qrCode = null;
  if (generateQR !== false) {
    qrCode = await generateQRCode(shortUrl);
  }

  // Create URL document
  const urlDoc = await Url.create({
    originalUrl,
    shortCode,
    customAlias: customAlias || null,
    shortUrl,
    userId: req.user._id,
    title: title || null,
    tags: tags || [],
    expiryDate: expiryDate || null,
    qrCode,
  });

  logger.info(`URL created: ${shortUrl} -> ${originalUrl} by user ${req.user.email}`);

  return sendSuccess(res, 201, 'URL shortened successfully!', {
    url: {
      id: urlDoc._id,
      originalUrl: urlDoc.originalUrl,
      shortCode: urlDoc.shortCode,
      shortUrl: urlDoc.shortUrl,
      customAlias: urlDoc.customAlias,
      title: urlDoc.title,
      tags: urlDoc.tags,
      clickCount: urlDoc.clickCount,
      expiryDate: urlDoc.expiryDate,
      isActive: urlDoc.isActive,
      qrCode: urlDoc.qrCode,
      createdAt: urlDoc.createdAt,
    },
  });
});

/**
 * @desc    Get all URLs for authenticated user
 * @route   GET /api/url/all
 * @access  Private
 */
const getAllUrls = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'all',
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = { userId: req.user._id };

  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: 'i' } },
      { shortCode: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (status === 'active') {
    query.isActive = true;
    query.$or = [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }];
  } else if (status === 'expired') {
    query.expiryDate = { $lte: new Date() };
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  // Sort configuration
  const sortConfig = {};
  const validSortFields = ['createdAt', 'clickCount', 'lastVisited', 'title', 'originalUrl'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  sortConfig[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [urls, total] = await Promise.all([
    Url.find(query).sort(sortConfig).skip(skip).limit(limitNum).lean(),
    Url.countDocuments(query),
  ]);

  // Add computed fields
  const enrichedUrls = urls.map((url) => ({
    ...url,
    isExpired: url.expiryDate ? new Date() > new Date(url.expiryDate) : false,
  }));

  return sendPaginated(res, enrichedUrls, pageNum, limitNum, total);
});

/**
 * @desc    Get a single URL by ID
 * @route   GET /api/url/:id
 * @access  Private
 */
const getUrlById = asyncHandler(async (req, res) => {
  const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

  if (!url) {
    return sendError(res, 404, 'URL not found or you do not have permission to access it.');
  }

  return sendSuccess(res, 200, 'URL fetched successfully', { url });
});

/**
 * @desc    Update a URL
 * @route   PUT /api/url/:id
 * @access  Private
 */
const updateUrl = asyncHandler(async (req, res) => {
  const { originalUrl, title, tags, expiryDate, isActive } = req.body;

  const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

  if (!url) {
    return sendError(res, 404, 'URL not found or you do not have permission to modify it.');
  }

  // Update fields
  if (originalUrl) {
    const sanitized = sanitizeUrl(originalUrl);
    if (!isValidUrl(sanitized)) {
      return sendError(res, 400, 'Please provide a valid URL.');
    }
    url.originalUrl = sanitized;
  }

  if (title !== undefined) url.title = title;
  if (tags !== undefined) url.tags = tags;
  if (expiryDate !== undefined) url.expiryDate = expiryDate || null;
  if (isActive !== undefined) url.isActive = isActive;

  await url.save();

  return sendSuccess(res, 200, 'URL updated successfully', { url });
});

/**
 * @desc    Delete a URL
 * @route   DELETE /api/url/:id
 * @access  Private
 */
const deleteUrl = asyncHandler(async (req, res) => {
  const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

  if (!url) {
    return sendError(res, 404, 'URL not found or you do not have permission to delete it.');
  }

  await Url.deleteOne({ _id: req.params.id });

  logger.info(`URL deleted: ${url.shortUrl} by user ${req.user.email}`);

  return sendSuccess(res, 200, 'URL deleted successfully.');
});

/**
 * @desc    Get analytics for a specific URL
 * @route   GET /api/url/analytics/:shortCode
 * @access  Private
 */
const getUrlAnalytics = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode, userId: req.user._id }).select('+visitHistory');

  if (!url) {
    return sendError(res, 404, 'URL not found or access denied.');
  }

  // Build analytics response
  const analyticsData = {
    urlInfo: {
      id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      shortCode: url.shortCode,
      title: url.title,
      createdAt: url.createdAt,
      lastVisited: url.lastVisited,
      isExpired: url.isExpired,
      expiryDate: url.expiryDate,
    },
    overview: {
      totalClicks: url.clickCount,
      uniqueDays: Object.keys(url.analytics?.dailyClicks?.toObject?.() || {}).length,
    },
    browsers: url.analytics?.browsers ? Object.fromEntries(url.analytics.browsers) : {},
    devices: url.analytics?.devices ? Object.fromEntries(url.analytics.devices) : {},
    operatingSystems: url.analytics?.operatingSystems ? Object.fromEntries(url.analytics.operatingSystems) : {},
    countries: url.analytics?.countries ? Object.fromEntries(url.analytics.countries) : {},
    referrers: url.analytics?.referrers ? Object.fromEntries(url.analytics.referrers) : {},
    dailyClicks: url.analytics?.dailyClicks ? Object.fromEntries(url.analytics.dailyClicks) : {},
    recentVisits: (url.visitHistory || [])
      .slice(-20)
      .reverse()
      .map((v) => ({
        timestamp: v.timestamp,
        browser: v.browser,
        device: v.device,
        os: v.os,
        country: v.country,
        referrer: v.referrer,
      })),
  };

  return sendSuccess(res, 200, 'Analytics fetched successfully', { analytics: analyticsData });
});

/**
 * @desc    Handle short URL redirect
 * @route   GET /:shortCode
 * @access  Public
 */
const redirectUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode, isActive: true }).select('+visitHistory');

  if (!url) {
    return res.status(404).json({
      success: false,
      message: 'Short URL not found. It may have been deleted or never existed.',
    });
  }

  // Check if URL has expired
  if (url.expiryDate && new Date() > new Date(url.expiryDate)) {
    return res.status(410).json({
      success: false,
      message: 'This link has expired and is no longer active.',
    });
  }

  // Extract visitor information and record visit (async, don't await)
  const visitInfo = extractVisitorInfo(req);
  url.recordVisit(visitInfo).catch((err) => logger.error('Visit recording error:', err));

  // Redirect to original URL
  return res.redirect(301, url.originalUrl);
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/url/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalUrls, allUrls] = await Promise.all([
    Url.countDocuments({ userId }),
    Url.find({ userId }).select('clickCount isActive expiryDate createdAt lastVisited'),
  ]);

  const now = new Date();
  let totalClicks = 0;
  let activeLinks = 0;
  let expiredLinks = 0;
  let clicksThisWeek = 0;
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  allUrls.forEach((url) => {
    totalClicks += url.clickCount;
    const isExpired = url.expiryDate && new Date(url.expiryDate) < now;
    if (url.isActive && !isExpired) activeLinks++;
    if (isExpired) expiredLinks++;
  });

  // Get recent URLs
  const recentUrls = await Url.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return sendSuccess(res, 200, 'Dashboard stats fetched successfully', {
    stats: {
      totalUrls,
      totalClicks,
      activeLinks,
      expiredLinks,
      inactiveLinks: totalUrls - activeLinks - expiredLinks,
    },
    recentUrls: recentUrls.map((url) => ({
      ...url,
      isExpired: url.expiryDate ? new Date() > new Date(url.expiryDate) : false,
    })),
  });
});

/**
 * @desc    Bulk shorten URLs from CSV
 * @route   POST /api/url/bulk
 * @access  Private
 */
const bulkCreateUrls = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'Please upload a CSV file.');
  }

  const results = [];
  const errors = [];

  // Parse CSV
  const records = [];
  await new Promise((resolve, reject) => {
    parse(req.file.buffer, { columns: true, skip_empty_lines: true }, (err, data) => {
      if (err) reject(err);
      else { records.push(...data); resolve(); }
    });
  });

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  for (let i = 0; i < Math.min(records.length, 50); i++) {
    const record = records[i];
    const { url: originalUrl, alias, title } = record;

    if (!originalUrl) {
      errors.push({ row: i + 1, error: 'URL is required' });
      continue;
    }

    try {
      const sanitized = sanitizeUrl(originalUrl.trim());
      if (!isValidUrl(sanitized)) {
        errors.push({ row: i + 1, url: originalUrl, error: 'Invalid URL' });
        continue;
      }

      let shortCode = alias ? alias.toLowerCase().trim() : generateShortCode(7);
      const existing = await Url.findOne({ shortCode });
      if (existing) shortCode = generateShortCode(7);

      const urlDoc = await Url.create({
        originalUrl: sanitized,
        shortCode,
        shortUrl: `${baseUrl}/${shortCode}`,
        userId: req.user._id,
        title: title || null,
        customAlias: alias ? alias.toLowerCase() : null,
      });

      results.push({
        originalUrl: sanitized,
        shortUrl: urlDoc.shortUrl,
        shortCode: urlDoc.shortCode,
      });
    } catch (err) {
      errors.push({ row: i + 1, url: originalUrl, error: err.message });
    }
  }

  return sendSuccess(res, 200, `Bulk operation complete: ${results.length} created, ${errors.length} failed`, {
    created: results,
    errors,
    summary: { created: results.length, failed: errors.length },
  });
});

/**
 * @desc    Export analytics as CSV
 * @route   GET /api/url/export
 * @access  Private
 */
const exportAnalytics = asyncHandler(async (req, res) => {
  const urls = await Url.find({ userId: req.user._id }).lean();

  const csvData = urls.map((url) => ({
    'Short URL': url.shortUrl,
    'Original URL': url.originalUrl,
    'Short Code': url.shortCode,
    'Title': url.title || '',
    'Total Clicks': url.clickCount,
    'Created At': new Date(url.createdAt).toLocaleDateString(),
    'Last Visited': url.lastVisited ? new Date(url.lastVisited).toLocaleDateString() : 'Never',
    'Expiry Date': url.expiryDate ? new Date(url.expiryDate).toLocaleDateString() : 'No expiry',
    'Status': url.isActive ? 'Active' : 'Inactive',
  }));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=url-analytics.csv');

  stringify(csvData, { header: true }, (err, output) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    res.send(output);
  });
});

/**
 * @desc    Regenerate QR code for a URL
 * @route   POST /api/url/:id/qr
 * @access  Private
 */
const regenerateQR = asyncHandler(async (req, res) => {
  const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

  if (!url) {
    return sendError(res, 404, 'URL not found.');
  }

  const qrCode = await generateQRCode(url.shortUrl);
  url.qrCode = qrCode;
  await url.save();

  return sendSuccess(res, 200, 'QR code regenerated successfully', { qrCode });
});

module.exports = {
  createUrl,
  getAllUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getUrlAnalytics,
  redirectUrl,
  getDashboardStats,
  bulkCreateUrls,
  exportAnalytics,
  regenerateQR,
};
