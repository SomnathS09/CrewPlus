const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} = require('../controllers/cartController');
const { optionalAuth, protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  addToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator
} = require('../validators/cartValidator');

// Cart routes (work with both session-based and user-based)
router.get('/', optionalAuth, getCart);
router.post('/items', optionalAuth, addToCartValidator, validate, addToCart);
router.put('/items/:itemId', optionalAuth, updateCartItemValidator, validate, updateCartItem);
router.delete('/items/:itemId', optionalAuth, removeCartItemValidator, validate, removeFromCart);
router.delete('/', optionalAuth, clearCart);

// Merge guest cart with user cart (after login)
router.post('/merge', protect, mergeCart);

module.exports = router;
