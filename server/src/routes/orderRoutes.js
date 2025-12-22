const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderAnalytics,
  trackOrder
} = require('../controllers/orderController');
const { protect, optionalAuth, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOrderValidator,
  updateOrderStatusValidator,
  getOrdersQueryValidator
} = require('../validators/orderValidator');

// Public route for tracking
router.get('/track/:orderNumber', trackOrder);

// Order creation (works for both guest and authenticated users)
router.post('/', optionalAuth, createOrderValidator, validate, createOrder);

// Protected routes for customers
router.get('/my-orders', protect, getOrdersQueryValidator, validate, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, isAdmin, getOrdersQueryValidator, validate, getAllOrders);
router.get('/admin/analytics', protect, isAdmin, getOrderAnalytics);
router.put('/:id/status', protect, isAdmin, updateOrderStatusValidator, validate, updateOrderStatus);

module.exports = router;
