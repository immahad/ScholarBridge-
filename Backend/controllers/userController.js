// backend/controllers/userController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Admin = require('../models/Admin');
const { deactivateUser } = require('../database/transactions/userTransactions');

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user data
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get role-specific profile
    let profile;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId });
    } else if (user.role === 'donor') {
      profile = await Donor.findOne({ userId });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ userId });
    }
    
    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, profileData } = req.body;
    
    // Update user basic info
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update role-specific profile
    let profile;
    if (user.role === 'student') {
      profile = await Student.findOneAndUpdate(
        { userId },
        { ...profileData },
        { new: true }
      );
    } else if (user.role === 'donor') {
      profile = await Donor.findOneAndUpdate(
        { userId },
        { ...profileData },
        { new: true }
      );
    } else if (user.role === 'admin') {
      profile = await Admin.findOneAndUpdate(
        { userId },
        { ...profileData },
        { new: true }
      );
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Get users
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

/**
 * Get user by ID (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user
    const user = await User.findById(id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get role-specific profile
    let profile;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: id });
    } else if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: id });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ userId: id });
    }
    
    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

/**
 * Deactivate user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deactivateUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.userId;
    
    // Use transaction to deactivate user
    const user = await deactivateUser(id, adminId, reason);
    
    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
};