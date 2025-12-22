const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { ROLES } = require('../config/constants');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.CUSTOMER
  });

  const token = generateToken(user._id, user.role);

  ApiResponse.created({
    user: user.toPublicJSON(),
    token
  }, 'Registration successful').send(res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);

  ApiResponse.success({
    user: user.toPublicJSON(),
    token
  }, 'Login successful').send(res);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success({
    user: req.user.toPublicJSON()
  }).send(res);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = { ...user.address, ...address };

  await user.save();

  ApiResponse.success({
    user: user.toPublicJSON()
  }, 'Profile updated successfully').send(res);
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id, user.role);

  ApiResponse.success({
    token
  }, 'Password changed successfully').send(res);
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query)
  ]);

  ApiResponse.success({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }).send(res);
});

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    throw ApiError.badRequest(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent changing own role
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  user.role = role;
  await user.save();

  ApiResponse.success({
    user: user.toPublicJSON()
  }, 'User role updated successfully').send(res);
});

// @desc    Create user (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists');
  }

  // Validate role
  if (role && !Object.values(ROLES).includes(role)) {
    throw ApiError.badRequest(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || ROLES.CUSTOMER,
    address
  });

  ApiResponse.created({
    user: user.toPublicJSON()
  }, 'User created successfully').send(res);
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent deactivating own account
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  ApiResponse.success({
    user: user.toPublicJSON()
  }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`).send(res);
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus
};
