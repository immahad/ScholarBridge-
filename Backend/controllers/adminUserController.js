const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const userTransactions = require('../database/transactions/userTransactions');

/**
 * Activate a user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User activated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

/**
 * Deactivate a user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cannot deactivate yourself
    if (req.user.userId === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Cannot deactivate another admin
    if (user.role === 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate another admin'
      });
    }
    
    // Update user
    user.isActive = false;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
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

/**
 * Get all students with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllStudents = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.institution) filter.institution = { $regex: req.query.institution, $options: 'i' };
    if (req.query.program) filter.program = { $regex: req.query.program, $options: 'i' };
    
    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }
    
    // Get students with count
    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      Student.countDocuments(filter)
    ]);
    
    return res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      students
    });
  } catch (error) {
    console.error('Get all students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
};

/**
 * Get all donors with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllDonors = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.donorType) filter.donorType = req.query.donorType;
    
    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { organizationName: searchRegex }
      ];
    }
    
    // Get donors with count
    const [donors, total] = await Promise.all([
      Donor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      Donor.countDocuments(filter)
    ]);
    
    return res.status(200).json({
      success: true,
      count: donors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      donors
    });
  } catch (error) {
    console.error('Get all donors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get donors',
      error: error.message
    });
  }
};

/**
 * Get all users with pagination and filters
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
    
    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ];
    }
    
    // Get users with count
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(filter)
    ]);
    
    // Get additional data for each user type
    const enhancedUsers = await Promise.all(
      users.map(async user => {
        const userData = user.toJSON();
        
        if (user.role === 'student') {
          const student = await Student.findOne({ userId: user._id });
          if (student) {
            // Get the latest application status
            let applicationStatus = 'pending';
            if (student.scholarshipApplications && student.scholarshipApplications.length > 0) {
              // Sort applications by date descending to get the latest
              const sortedApplications = [...student.scholarshipApplications]
                .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
              
              applicationStatus = sortedApplications[0].status;
              
              // Check if any application is funded
              const hasFundedApplication = student.scholarshipApplications.some(app => 
                app.paymentId && app.status === 'approved'
              );
              
              if (hasFundedApplication) {
                applicationStatus = 'funded';
              }
            }
            
            return {
              ...userData,
              school: student.institution,
              graduationYear: student.graduationYear,
              applicationStatus
            };
          }
        } else if (user.role === 'donor') {
          const donor = await Donor.findOne({ userId: user._id });
          if (donor) {
            // Count donations and total amount
            let donationsMade = 0;
            let totalDonated = 0;
            
            if (donor.donations && donor.donations.length > 0) {
              donationsMade = donor.donations.length;
              totalDonated = donor.donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
            }
            
            return {
              ...userData,
              organizationName: donor.organizationName,
              donationsMade,
              totalDonated
            };
          }
        }
        
        return userData;
      })
    );
    
    return res.status(200).json({
      success: true,
      count: enhancedUsers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users: enhancedUsers
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
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get role-specific profile based on user role
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ userId: user._id });
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
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role } = req.body;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      {
        email,
        firstName,
        lastName,
        role,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
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
    const result = await userTransactions.deleteUserAccount(id, force);
    
    if (result.wasDeactivated) {
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

/**
 * Get student by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get scholarship applications with details
    const populatedStudent = await Student.findById(id)
      .populate({
        path: 'scholarshipApplications.scholarshipId',
        select: 'title description amount deadlineDate'
      })
      .select('-password');
    
    return res.status(200).json({
      success: true,
      student: populatedStudent
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get student details',
      error: error.message
    });
  }
}; 