/**
 * URL Model
 * Comprehensive schema for URL shortening with analytics tracking
 */

const mongoose = require('mongoose');

// Sub-schema for individual visit records
const visitSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    browserVersion: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    osVersion: {
      type: String,
      default: 'Unknown',
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
  },
  { _id: true }
);

// Main URL schema
const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
      maxlength: [2048, 'URL too long'],
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    customAlias: {
      type: String,
      default: null,
      sparse: true,
      trim: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: null,
      maxlength: [200, 'Title too long'],
    },
    description: {
      type: String,
      default: null,
      maxlength: [500, 'Description too long'],
    },
    tags: {
      type: [String],
      default: [],
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    visitHistory: {
      type: [visitSchema],
      default: [],
      select: false, // Don't include in default queries for performance
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    qrCode: {
      type: String,
      default: null,
    },
    // Analytics aggregates (cached for performance)
    analytics: {
      browsers: {
        type: Map,
        of: Number,
        default: {},
      },
      devices: {
        type: Map,
        of: Number,
        default: {},
      },
      operatingSystems: {
        type: Map,
        of: Number,
        default: {},
      },
      countries: {
        type: Map,
        of: Number,
        default: {},
      },
      referrers: {
        type: Map,
        of: Number,
        default: {},
      },
      dailyClicks: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    lastVisited: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ shortCode: 1, isActive: 1 });
urlSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiryDate: { $ne: null } } });

// Virtual: check if URL is expired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > new Date(this.expiryDate);
});

// Virtual: time remaining before expiry
urlSchema.virtual('timeRemaining').get(function () {
  if (!this.expiryDate) return null;
  const remaining = new Date(this.expiryDate) - new Date();
  if (remaining <= 0) return 'Expired';
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
});

// Pre-save: set shortCode to lowercase
urlSchema.pre('save', function (next) {
  this.shortCode = this.shortCode.toLowerCase();
  if (this.customAlias) {
    this.customAlias = this.customAlias.toLowerCase();
  }
  next();
});

// Method: record a visit and update analytics
urlSchema.methods.recordVisit = async function (visitData) {
  this.clickCount += 1;
  this.lastVisited = new Date();

  // Add to visit history (limit to 1000 recent visits for performance)
  if (this.visitHistory.length >= 1000) {
    this.visitHistory.shift();
  }
  this.visitHistory.push(visitData);

  // Update analytics aggregates
  const { browser, device, os, country, referrer } = visitData;
  const today = new Date().toISOString().split('T')[0];

  // Update browser stats
  if (browser) {
    const browserCount = this.analytics.browsers.get(browser) || 0;
    this.analytics.browsers.set(browser, browserCount + 1);
  }

  // Update device stats
  if (device) {
    const deviceCount = this.analytics.devices.get(device) || 0;
    this.analytics.devices.set(device, deviceCount + 1);
  }

  // Update OS stats
  if (os) {
    const osCount = this.analytics.operatingSystems.get(os) || 0;
    this.analytics.operatingSystems.set(os, osCount + 1);
  }

  // Update country stats
  if (country) {
    const countryCount = this.analytics.countries.get(country) || 0;
    this.analytics.countries.set(country, countryCount + 1);
  }

  // Update referrer stats
  const ref = referrer || 'Direct';
  const refCount = this.analytics.referrers.get(ref) || 0;
  this.analytics.referrers.set(ref, refCount + 1);

  // Update daily click count
  const dailyCount = this.analytics.dailyClicks.get(today) || 0;
  this.analytics.dailyClicks.set(today, dailyCount + 1);

  this.markModified('analytics');
  this.markModified('visitHistory');
  await this.save();
};

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;
