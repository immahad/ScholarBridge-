const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const mongoose = require('mongoose');
const userTransactions = require('../database/transactions/userTransactions');

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Cannot delete another admin
    if (user.role === 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete another admin'
      });
    }
    
    // Use transaction to delete user
    const { success, message, wasDeactivated } = await userTransactions.deleteUserAccount(id, force);
    
    if (wasDeactivated) {
      return res.status(200).json({
        success: true,
        message: 'User has related data and was deactivated instead. Use force=true to hard delete.',
        wasDeactivated: true
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

module.exports = deleteUser;
