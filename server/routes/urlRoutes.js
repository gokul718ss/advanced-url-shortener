/**
 * URL Routes
 * Handles all URL management and analytics endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  createUrl,
  getAllUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getUrlAnalytics,
  getDashboardStats,
  bulkCreateUrls,
  exportAnalytics,
  regenerateQR,
} = require('../controllers/urlController');

const { protect } = require('../middleware/auth');
const { createUrlValidation, updateUrlValidation } = require('../validators/urlValidators');
const { handleValidationErrors } = require('../validators/authValidators');

// Multer for CSV bulk import
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// All routes below require authentication
router.use(protect);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Export analytics
router.get('/export', exportAnalytics);

// Bulk URL creation from CSV
router.post('/bulk', csvUpload.single('csvFile'), bulkCreateUrls);

// Analytics for a specific URL (by short code) - must come BEFORE /:id
router.get('/analytics/:shortCode', getUrlAnalytics);

// URL CRUD
router.post('/create', createUrlValidation, handleValidationErrors, createUrl);
router.get('/all', getAllUrls);
router.get('/:id', getUrlById);
router.put('/:id', updateUrlValidation, handleValidationErrors, updateUrl);
router.delete('/:id', deleteUrl);

// QR code regeneration
router.post('/:id/qr', regenerateQR);

module.exports = router;
