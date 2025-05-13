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
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

const isStudent = roleCheck('student');

const isDonor = (req, res, next) => {
  if (!req.user || req.user.role !== 'donor') {
    return res.status(403).json({ message: 'Access denied. Donors only.' });
  }
  next();
};

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
 * Middleware to check if user is a donor with access to a scholarship
 * Allows access if:
 * 1. User is an admin
 * 2. User is the donor who created the scholarship
 * 
 * @returns {Function} Express middleware
 */
const isDonorOrOwner = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Admin can access any scholarship
      if (req.user.role === 'admin') {
        return next();
      }
      
      // For donor role, check if they own the scholarship
      if (req.user.role === 'donor') {
        const scholarshipId = req.params.id;
        if (!scholarshipId) {
          return res.status(400).json({ message: 'Scholarship ID is required' });
        }
        
        const Scholarship = require('../models/Scholarship');
        const scholarship = await Scholarship.findById(scholarshipId);
        
        if (!scholarship) {
          return res.status(404).json({ message: 'Scholarship not found' });
        }
        
        // Check if the logged-in donor is the creator of the scholarship
        if (scholarship.createdBy && scholarship.createdBy.toString() === req.user._id.toString()) {
          return next();
        }
      }
      
      // If we get here, the user doesn't have permission
      return res.status(403).json({ message: 'Access denied. You do not have permission to view this scholarship.' });
    } catch (error) {
      console.error('Error in isDonorOrOwner middleware:', error);
      return res.status(500).json({ message: 'Server error checking permissions' });
    }
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
  isDonorOrOwner,
  hasAdminPermission
};