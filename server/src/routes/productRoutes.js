const express = require('express');
const router = express.Router();
const {
  getProducts,
  getMenu,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getAllProductsAdmin,
  getLowStockProducts
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createProductValidator,
  updateProductValidator,
  updateInventoryValidator
} = require('../validators/productValidator');

// Public routes
router.get('/', getProducts);
router.get('/menu', getMenu);
router.get('/:id', getProduct);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAllProductsAdmin);
router.get('/admin/low-stock', protect, isAdmin, getLowStockProducts);
router.post('/', protect, isAdmin, createProductValidator, validate, createProduct);
router.put('/:id', protect, isAdmin, updateProductValidator, validate, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.put('/:id/inventory', protect, isAdmin, updateInventoryValidator, validate, updateInventory);

module.exports = router;
