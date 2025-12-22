const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
} = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, validate, updateProfile);
router.put('/password', protect, changePasswordValidator, validate, changePassword);

// Admin routes
router.get('/users', protect, isAdmin, getAllUsers);
router.post('/users', protect, isAdmin, registerValidator, validate, createUser);
router.put('/users/:id/role', protect, isAdmin, updateUserRole);
router.put('/users/:id/status', protect, isAdmin, toggleUserStatus);

module.exports = router;
