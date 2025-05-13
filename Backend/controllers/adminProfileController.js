const Admin = require('../models/Admin');

/**
 * Get admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const admin = await Admin.findOne({ userId }).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get admin profile',
      error: error.message
    });
  }
};

/**
 * Update admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, email, phoneNumber } = req.body;
    
    // Find and update admin
    const admin = await Admin.findOneAndUpdate(
      { userId },
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      admin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Get admin activity log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getActivityLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find admin and get activities
    const admin = await Admin.findOne({ userId }).select('activities');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    // Sort activities by timestamp descending
    const sortedActivities = [...admin.activities || []].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    return res.status(200).json({
      success: true,
      activities: sortedActivities
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get activity log',
      error: error.message
    });
  }
}; 