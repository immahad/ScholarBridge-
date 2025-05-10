const mongoose = require('mongoose');

/**
 * Custom Error Class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Function to create a custom API error
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Array} errors - Additional error details
 * @returns {APIError} Custom API error
 */
const createError = (message, statusCode = 500, errors = []) => {
  return new APIError(message, statusCode, errors);
};

/**
 * Error handling middleware for Express
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} Error response
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  let error = { ...err };
  error.message = err.message;
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    let message = `Duplicate field value: ${field} with value: ${value}. Please use another value.`;
    
    // Provide more specific message for CNIC duplicates
    if (field === 'cnic') {
      message = `This CNIC (${value}) is already registered with another account. Please use your own CNIC.`;
    } else if (field === 'email') {
      message = `This email address (${value}) is already registered. Please use another email address.`;
    }
    
    error = createError(message, 400);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = 'Invalid input data';
    
    error = createError(message, 400, errors);
  }
  
  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = createError(message, 400);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createError('Invalid token. Please log in again.', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = createError('Your token has expired. Please log in again.', 401);
  }
  
  // Send response based on error type
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: error.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Middleware to handle 404 errors for routes not found
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} 404 response
 */
const notFound = (req, res, next) => {
  const error = createError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Middleware to handle async errors
 * @param {Function} fn - Async function
 * @returns {Function} Middleware function with error handling
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  createError,
  errorHandler,
  notFound,
  asyncHandler,
  APIError
}; 