const { body, param, query } = require('express-validator');
const { ORDER_TYPES, ORDER_STATUS } = require('../config/constants');

const createOrderValidator = [
  body('type')
    .notEmpty()
    .withMessage('Order type is required')
    .isIn(Object.values(ORDER_TYPES))
    .withMessage(`Order type must be one of: ${Object.values(ORDER_TYPES).join(', ')}`),

  body('customerInfo.name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),

  body('customerInfo.email')
    .trim()
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('customerInfo.phone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),

  body('deliveryAddress')
    .if(body('type').equals('delivery'))
    .notEmpty()
    .withMessage('Delivery address is required for delivery orders'),

  body('deliveryAddress.street')
    .if(body('type').equals('delivery'))
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('deliveryAddress.city')
    .if(body('type').equals('delivery'))
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('deliveryAddress.zipCode')
    .if(body('type').equals('delivery'))
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'online'])
    .withMessage('Invalid payment method'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateOrderStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(ORDER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`)
];

const getOrdersQueryValidator = [
  query('status')
    .optional()
    .isIn(Object.values(ORDER_STATUS))
    .withMessage('Invalid status'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  createOrderValidator,
  updateOrderStatusValidator,
  getOrdersQueryValidator
};
