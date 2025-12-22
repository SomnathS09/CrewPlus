const { body, param } = require('express-validator');

const addToCartValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('size')
    .optional()
    .isIn(['small', 'medium', 'large', 'extra_large'])
    .withMessage('Invalid size'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

const updateCartItemValidator = [
  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

const removeCartItemValidator = [
  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID')
];

module.exports = {
  addToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator
};
