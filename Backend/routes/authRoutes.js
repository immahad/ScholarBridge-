const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');
const { verifyToken, verifyRefreshToken, checkAccountLocked } = require('../middleware/auth');
const debugMiddleware = require('../middleware/debugMiddleware');

// Apply debug middleware to all auth routes in development
if (process.env.NODE_ENV === 'development') {
  router.use(debugMiddleware);
}

// Register a new user
router.post(
  '/register',
  validate(schemas.auth.register),
  authController.register
);

// Login user
router.post(
  '/login',
  validate(schemas.auth.login),
  checkAccountLocked,
  authController.login
);

// Refresh access token
router.post(
  '/refresh-token',
  validate(schemas.auth.refreshToken),
  verifyRefreshToken,
  authController.refreshToken
);

// Get current user
router.get(
  '/me',
  verifyToken,
  authController.getCurrentUser
);

// Request password reset
router.post(
  '/forgot-password',
  validate(schemas.auth.forgotPassword),
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password/:token',
  validate(schemas.auth.resetPassword),
  authController.resetPassword
);

// Verify email
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

// Logout user
router.post(
  '/logout',
  verifyToken,
  authController.logout
);

// Change password
router.post(
  '/change-password',
  verifyToken,
  authController.changePassword
);

module.exports = router;