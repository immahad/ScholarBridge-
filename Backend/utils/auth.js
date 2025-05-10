const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { hash } = require('./encryption');

/**
 * Authentication utilities
 */

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} secret - Secret key
 * @param {Object} options - JWT options
 * @returns {String} - JWT token
 */
exports.generateToken = (payload, secret = config.jwt.secret, options = {}) => {
  const defaultOptions = {
    expiresIn: config.jwt.expire,
    issuer: 'scholarship-management-system',
    audience: 'sms-users'
  };

  return jwt.sign(
    payload,
    secret,
    { ...defaultOptions, ...options }
  );
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {String} - Refresh token
 */
exports.generateRefreshToken = (payload) => {
  return exports.generateToken(
    payload, 
    config.jwt.refreshSecret, 
    { expiresIn: config.jwt.refreshExpire }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @param {String} secret - Secret key
 * @returns {Object} - Decoded token payload or null if invalid
 */
exports.verifyToken = (token, secret = config.jwt.secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

/**
 * Generate password hash
 * @param {String} password - Plain text password
 * @returns {Promise<String>} - Hashed password
 */
exports.hashPassword = async (password) => {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Promise<Boolean>} - True if passwords match
 */
exports.comparePassword = async (password, hashedPassword) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate password reset token
 * @returns {Object} - Object containing token and hashed token
 */
exports.generateResetToken = () => {
  // Generate a random token
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  // Hash token to store in database
  const hashedToken = hash(resetToken);
  
  return {
    resetToken,
    hashedToken
  };
};

/**
 * Check if a user has the required permission
 * @param {Object} user - User object
 * @param {String} permission - Required permission
 * @returns {Boolean} - True if user has permission
 */
exports.hasPermission = (user, permission) => {
  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }
  
  // Super admin has all admin permissions
  if (user.adminLevel === 'super_admin') {
    return true;
  }
  
  // Check specific permission
  return user.permissions && user.permissions[permission] === true;
}; 