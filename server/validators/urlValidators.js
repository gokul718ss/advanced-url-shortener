/**
 * URL Validators
 * Input validation rules for URL management endpoints
 */

const { body, param } = require('express-validator');

/**
 * Create URL validation rules
 */
const createUrlValidation = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('Original URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: false })
    .withMessage('Please provide a valid URL'),

  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Custom alias must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),

  body('expiryDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Expiry date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),

  body('title')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed'),
];

/**
 * Update URL validation rules
 */
const updateUrlValidation = [
  body('originalUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: false })
    .withMessage('Please provide a valid URL'),

  body('title')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('expiryDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Expiry date must be a valid date'),
];

/**
 * MongoDB ObjectId validation
 */
const mongoIdValidation = (field) => [
  param(field)
    .isMongoId().withMessage(`Invalid ${field} format`),
];

module.exports = { createUrlValidation, updateUrlValidation, mongoIdValidation };
