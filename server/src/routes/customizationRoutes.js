const express = require('express');
const router = express.Router();
const {
  getCustomizations,
  getAllCustomizationsAdmin,
  createCustomization,
  updateCustomization,
  deleteCustomization,
  toggleCustomization
} = require('../controllers/customizationController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getCustomizations);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAllCustomizationsAdmin);
router.post('/', protect, isAdmin, createCustomization);
router.put('/:id', protect, isAdmin, updateCustomization);
router.delete('/:id', protect, isAdmin, deleteCustomization);
router.put('/:id/toggle', protect, isAdmin, toggleCustomization);

module.exports = router;
