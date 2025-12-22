const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  toggleCouponStatus
} = require('../controllers/couponController');
const { protect, isAdmin, optionalAuth } = require('../middleware/auth');

// Public/User routes
router.post('/validate', optionalAuth, validateCoupon);

// Admin routes
router.get('/', protect, isAdmin, getAllCoupons);
router.post('/', protect, isAdmin, createCoupon);
router.get('/:id', protect, isAdmin, getCoupon);
router.put('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);
router.put('/:id/toggle', protect, isAdmin, toggleCouponStatus);

module.exports = router;
