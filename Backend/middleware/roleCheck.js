const { createError } = require('./errorHandler');

/**
 * Role-based access control middleware
 * Check if the authenticated user has the required role
 * 
 * @param {String|Array} roles - Role or array of roles that have access
 * @returns {Function} Express middleware
 */
const roleCheck = (roles) => {
  // Convert string to array if single role is provided
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }
    
    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(createError('Access denied. Insufficient role permissions', 403));
    }
    
    next();
  };
};

/**
 * Specific role check middlewares for convenience
 */
const isAdmin = roleCheck('admin');
const isStudent = roleCheck('student');
const isDonor = roleCheck('donor');
const isAdminOrDonor = roleCheck(['admin', 'donor']);
const isAnyUser = roleCheck(['admin', 'student', 'donor']);

/**
 * Middleware to check if user is accessing their own resource
 * 
 * @param {String} paramIdField - Name of the route parameter containing the resource ID
 * @returns {Function} Express middleware
 */
const isOwnResource = (paramIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }
    
    const resourceId = req.params[paramIdField];
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if resource ID matches user ID
    if (resourceId && resourceId !== req.user._id.toString()) {
      return next(createError('Access denied. You can only access your own resources', 403));
    }
    
    next();
  };
};

/**
 * Middleware to check admin permissions
 * 
 * @param {String} permission - Permission to check
 * @returns {Function} Express middleware
 */
const hasAdminPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }
    
    if (req.user.role !== 'admin') {
      return next(createError('Access denied. Admin role required', 403));
    }
    
    // Super admin has all permissions
    if (req.user.adminLevel === 'super_admin') {
      return next();
    }
    
    // Check specific permission
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return next(createError(`Access denied. Missing '${permission}' permission`, 403));
    }
    
    next();
  };
};

module.exports = {
  roleCheck,
  isAdmin,
  isStudent,
  isDonor,
  isAdminOrDonor,
  isAnyUser,
  isOwnResource,
  hasAdminPermission
}; 