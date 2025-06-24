import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('jobTitle')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  
  body('subscriptionType')
    .isIn(['monthly', 'quarterly', 'yearly', 'trial'])
    .withMessage('Invalid subscription type')
];

export const validatePayment = [
  body('subscriptionType')
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid subscription type'),
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}; 