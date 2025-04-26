const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  refreshToken,
  logout
} = require('../controllers/auth.controller');
const { authenticate, asyncHandler } = require('../middleware/auth');

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh-token', asyncHandler(refreshToken));
router.post('/logout', asyncHandler(logout));

// Protected routes
router.get('/profile', authenticate, asyncHandler(getProfile));

module.exports = router; 