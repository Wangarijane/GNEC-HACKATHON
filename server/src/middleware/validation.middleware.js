// ============================================================================
// SERVER - VALIDATION MIDDLEWARE
// ============================================================================

// server/src/middleware/validation.middleware.js
import { body } from 'express-validator';

// User registration validation
export const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('userType').isIn(['business', 'recipient', 'driver']).withMessage('Invalid user type')
];

// User login validation
export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Food item creation validation
export const validateFoodItem = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['meals', 'bakery', 'produce', 'dairy', 'beverages', 'snacks', 'other']).withMessage('Invalid category'),
  body('quantity.value').isFloat({ min: 0.1 }).withMessage('Quantity must be a positive number'),
  body('quantity.unit').isIn(['kg', 'lbs', 'servings', 'pieces', 'liters', 'gallons']).withMessage('Invalid quantity unit'),
  body('estimatedValue').isFloat({ min: 0 }).withMessage('Estimated value must be positive'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date is required')
];