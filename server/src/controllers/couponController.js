const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    type,
    value,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    userUsageLimit,
    validFrom,
    validUntil,
    applicableCategories
  } = req.body;

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw ApiError.badRequest('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    type,
    value,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    userUsageLimit,
    validFrom,
    validUntil,
    applicableCategories
  });

  ApiResponse.created({ coupon }, 'Coupon created successfully').send(res);
});

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 20 } = req.query;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Coupon.countDocuments(query)
  ]);

  ApiResponse.success({
    coupons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }).send(res);
});

// @desc    Get coupon by ID (Admin only)
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  ApiResponse.success({ coupon }).send(res);
});

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  const allowedUpdates = [
    'description',
    'type',
    'value',
    'minOrderAmount',
    'maxDiscount',
    'usageLimit',
    'userUsageLimit',
    'validFrom',
    'validUntil',
    'isActive',
    'applicableCategories'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  await coupon.save();

  ApiResponse.success({ coupon }, 'Coupon updated successfully').send(res);
});

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  await Coupon.findByIdAndDelete(req.params.id);

  ApiResponse.success(null, 'Coupon deleted successfully').send(res);
});

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Public (session-based) / Private (user-based)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const userId = req.user?._id;

  if (!code) {
    throw ApiError.badRequest('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  // Check if coupon is valid
  const now = new Date();
  if (!coupon.isActive) {
    throw ApiError.badRequest('This coupon is no longer active');
  }

  if (now < coupon.validFrom) {
    throw ApiError.badRequest('This coupon is not yet valid');
  }

  if (now > coupon.validUntil) {
    throw ApiError.badRequest('This coupon has expired');
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit');
  }

  // Check user usage limit
  if (userId) {
    const userUsages = coupon.usedBy.filter(u => u.user.toString() === userId.toString());
    if (userUsages.length >= coupon.userUsageLimit) {
      throw ApiError.badRequest('You have already used this coupon the maximum number of times');
    }
  }

  // Check minimum order amount
  if (subtotal < coupon.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
  }

  // Calculate discount
  const discount = coupon.calculateDiscount(subtotal);

  ApiResponse.success({
    coupon: {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      discount
    }
  }, 'Coupon applied successfully').send(res);
});

// @desc    Toggle coupon status (Admin only)
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  ApiResponse.success({ coupon }, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`).send(res);
});

module.exports = {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  toggleCouponStatus
};
