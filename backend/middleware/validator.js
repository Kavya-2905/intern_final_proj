const { body, validationResult } = require('express-validator');

// Validation result middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: errors.array().map(err => err.msg).join(', '),
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
    .custom((value) => {
      if (!value.endsWith('@gmail.com')) {
        throw new Error('Only @gmail.com email addresses are accepted');
      }
      return true;
    }),
  body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  exports.validate
];

// Login validation
exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  exports.validate
];

// Transaction validation
exports.transactionValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  exports.validate
];

// Transfer validation
exports.transferValidation = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  exports.validate
];
