const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all products (menu)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, isVegetarian, isSpicy, inStock, page = 1, limit = 20 } = req.query;

  const query = { isAvailable: true };

  if (category) query.category = category;
  if (isVegetarian === 'true') query.isVegetarian = true;
  if (isSpicy === 'true') query.isSpicy = true;
  if (inStock === 'true') query.inventory = { $gt: 0 };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(query)
  ]);

  ApiResponse.success({
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }).send(res);
});

// @desc    Get products grouped by category (for menu display)
// @route   GET /api/products/menu
// @access  Public
const getMenu = asyncHandler(async (req, res) => {
  const products = await Product.find({ isAvailable: true, inventory: { $gt: 0 } })
    .sort({ name: 1 });

  const menu = {
    pizzas: products.filter(p => p.category === 'pizza'),
    drinks: products.filter(p => p.category === 'drink'),
    breads: products.filter(p => p.category === 'bread')
  };

  ApiResponse.success({ menu }).send(res);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  ApiResponse.success({ product }).send(res);
});

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  ApiResponse.created({ product }, 'Product created successfully').send(res);
});

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  ApiResponse.success({ product }, 'Product updated successfully').send(res);
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Soft delete - just mark as unavailable
  product.isAvailable = false;
  await product.save();

  ApiResponse.success(null, 'Product deleted successfully').send(res);
});

// @desc    Update product inventory (Admin only)
// @route   PUT /api/products/:id/inventory
// @access  Private/Admin
const updateInventory = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  switch (operation) {
    case 'add':
      product.inventory += quantity;
      break;
    case 'subtract':
      if (product.inventory < quantity) {
        throw ApiError.badRequest('Insufficient inventory');
      }
      product.inventory -= quantity;
      break;
    case 'set':
      if (quantity < 0) {
        throw ApiError.badRequest('Inventory cannot be negative');
      }
      product.inventory = quantity;
      break;
  }

  await product.save();

  ApiResponse.success({ product }, 'Inventory updated successfully').send(res);
});

// @desc    Get all products for admin (including unavailable)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(query)
  ]);

  ApiResponse.success({
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }).send(res);
});

// @desc    Get low stock products (Admin only)
// @route   GET /api/products/admin/low-stock
// @access  Private/Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;

  const products = await Product.find({
    inventory: { $lte: threshold },
    isAvailable: true
  }).sort({ inventory: 1 });

  ApiResponse.success({ products, threshold }).send(res);
});

module.exports = {
  getProducts,
  getMenu,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getAllProductsAdmin,
  getLowStockProducts
};
