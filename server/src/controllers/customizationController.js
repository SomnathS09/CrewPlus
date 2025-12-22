const Customization = require('../models/Customization');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all customizations (public)
// @route   GET /api/customizations
// @access  Public
const getCustomizations = asyncHandler(async (req, res) => {
  const { type, category } = req.query;

  const query = { isAvailable: true };
  if (type) query.type = type;
  if (category) query.applicableCategories = category;

  const customizations = await Customization.find(query).sort({ type: 1, name: 1 });

  // Group by type
  const grouped = customizations.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  ApiResponse.success({ customizations, grouped }).send(res);
});

// @desc    Get all customizations for admin
// @route   GET /api/customizations/admin/all
// @access  Private/Admin
const getAllCustomizationsAdmin = asyncHandler(async (req, res) => {
  const customizations = await Customization.find().sort({ type: 1, name: 1 });

  ApiResponse.success({ customizations }).send(res);
});

// @desc    Create customization (Admin only)
// @route   POST /api/customizations
// @access  Private/Admin
const createCustomization = asyncHandler(async (req, res) => {
  const { name, type, price, isVegetarian, applicableCategories } = req.body;

  const customization = await Customization.create({
    name,
    type,
    price: price || 0,
    isVegetarian: isVegetarian !== false,
    applicableCategories: applicableCategories || ['pizza']
  });

  ApiResponse.created({ customization }, 'Customization created successfully').send(res);
});

// @desc    Update customization (Admin only)
// @route   PUT /api/customizations/:id
// @access  Private/Admin
const updateCustomization = asyncHandler(async (req, res) => {
  const customization = await Customization.findById(req.params.id);

  if (!customization) {
    throw ApiError.notFound('Customization not found');
  }

  const allowedUpdates = ['name', 'type', 'price', 'isVegetarian', 'isAvailable', 'applicableCategories'];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      customization[field] = req.body[field];
    }
  });

  await customization.save();

  ApiResponse.success({ customization }, 'Customization updated successfully').send(res);
});

// @desc    Delete customization (Admin only)
// @route   DELETE /api/customizations/:id
// @access  Private/Admin
const deleteCustomization = asyncHandler(async (req, res) => {
  const customization = await Customization.findById(req.params.id);

  if (!customization) {
    throw ApiError.notFound('Customization not found');
  }

  await Customization.findByIdAndDelete(req.params.id);

  ApiResponse.success(null, 'Customization deleted successfully').send(res);
});

// @desc    Toggle customization availability (Admin only)
// @route   PUT /api/customizations/:id/toggle
// @access  Private/Admin
const toggleCustomization = asyncHandler(async (req, res) => {
  const customization = await Customization.findById(req.params.id);

  if (!customization) {
    throw ApiError.notFound('Customization not found');
  }

  customization.isAvailable = !customization.isAvailable;
  await customization.save();

  ApiResponse.success({ customization }, `Customization ${customization.isAvailable ? 'enabled' : 'disabled'}`).send(res);
});

module.exports = {
  getCustomizations,
  getAllCustomizationsAdmin,
  createCustomization,
  updateCustomization,
  deleteCustomization,
  toggleCustomization
};
