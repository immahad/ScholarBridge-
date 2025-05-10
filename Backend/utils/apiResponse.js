// backend/utils/apiResponse.js
/**
 * Utility functions for standardizing API responses
 */

/**
 * Create a success response object
 * @param {String} message - Success message
 * @param {Object|Array} data - Response data
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} - Formatted response object
 */
exports.successResponse = (message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    statusCode
  };

  if (data) {
    response.data = data;
  }

  return response;
};

/**
 * Create an error response object
 * @param {String} message - Error message
 * @param {Array} errors - Detailed error messages
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} - Formatted error object
 */
exports.errorResponse = (message, errors = [], statusCode = 400) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return response;
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Data to paginate
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @param {String} message - Success message
 * @returns {Object} - Paginated response
 */
exports.paginatedResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
    count: data.length,
    data
  });
};

/**
 * Send a 404 Not Found response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @returns {Object} - 404 response
 */
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message
  });
};

/**
 * Send a 401 Unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @returns {Object} - 401 response
 */
exports.unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Send a 403 Forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @returns {Object} - 403 response
 */
exports.forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

/**
 * Send a 500 Internal Server Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Error} error - Error object
 * @returns {Object} - 500 response
 */
exports.serverErrorResponse = (res, message = 'Internal server error', error = null) => {
  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message;
    response.stack = error.stack;
  }

  return res.status(500).json(response);
};