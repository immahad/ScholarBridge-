const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT token using passport
 * @returns {Function} Express middleware
 */
exports.authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * Middleware to ensure user has required role
 * 
 * @param {String[]} roles - Array of allowed roles
 * @returns {Function} Express middleware
 */
exports.authorize = (roles = []) => {
  // Convert single role to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // User should be authenticated and available in req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Authentication required'
      });
    }

    // Check if user's role is included in the authorized roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Insufficient permissions'
      });
    }

    // Authentication and authorization successful
    next();
  };
};

/**
 * Middleware to check if account is locked
 * @returns {Function} Express middleware
 */
exports.checkAccountLocked = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    const user = await User.findOne({ email }).select('+loginAttempts +lockedUntil');

    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      // Calculate remaining lock time in minutes
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / (1000 * 60));
      
      return res.status(423).json({
        success: false,
        message: `Account is locked. Please try again in ${remainingTime} minutes.`
      });
    }

    next();
  } catch (error) {
    console.error('Error checking account lock status:', error);
    next(error);
  }
};

/**
 * Middleware to verify JWT token from request header
 * @returns {Function} Express middleware
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token format'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not found'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Account is deactivated'
      });
    }
    
    // Check if token version matches (for token invalidation)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Token has been invalidated'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Token expired'
      });
    }
    
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to verify refresh token
 * @returns {Function} Express middleware
 */
exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not found'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Account is deactivated'
      });
    }
    
    // Check if token version matches (for token invalidation)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Token has been invalidated'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid refresh token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Refresh token expired'
      });
    }
    
    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
}; 