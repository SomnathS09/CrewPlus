const { body, param } = require('express-validator');
const { CATEGORIES } = require('../config/constants');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(CATEGORIES).join(', ')}`),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('inventory')
    .notEmpty()
    .withMessage('Inventory is required')
    .isInt({ min: 0 })
    .withMessage('Inventory must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid image URL'),

  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean'),

  body('isSpicy')
    .optional()
    .isBoolean()
    .withMessage('isSpicy must be a boolean'),

  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array')
];

const updateProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(Object.values(CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(CATEGORIES).join(', ')}`),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('inventory')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory must be a non-negative integer')
];

const updateInventoryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer'),

  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['add', 'subtract', 'set'])
    .withMessage('Operation must be add, subtract, or set')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  updateInventoryValidator
};
