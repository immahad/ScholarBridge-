const Scholarship = require('../models/Scholarship');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Create new scholarship
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createScholarship = async (req, res) => {
  try {
    const { title, description, amount, criteria, deadlineDate } = req.body;
    const adminId = req.user.userId;
    
    // Create new scholarship
    const scholarship = new Scholarship({
      title,
      description,
      amount,
      criteria,
      deadlineDate,
      createdBy: adminId,
      status: 'active'
    });
    
    // Save scholarship
    await scholarship.save();
    
    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      scholarship
    });
  } catch (error) {
    console.error('Create scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create scholarship',
      error: error.message
    });
  }
};

/**
 * Update scholarship
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    // For admin updates, we only allow changing title and description
    // Find current scholarship first
    const existingScholarship = await Scholarship.findById(id);
    
    if (!existingScholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    // Update only title and description
    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      {
        title: title || existingScholarship.title,
        description: description || existingScholarship.description,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log(`Admin updated scholarship ${id}: Title and/or description modified`);
    
    return res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully',
      scholarship
    });
  } catch (error) {
    console.error('Update scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update scholarship',
      error: error.message
    });
  }
};

/**
 * Get all scholarships
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllScholarships = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    
    // Get scholarships with count
    const [scholarships, total] = await Promise.all([
      Scholarship.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName'),
      Scholarship.countDocuments(filter)
    ]);
    
    return res.status(200).json({
      success: true,
      count: scholarships.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      scholarships
    });
  } catch (error) {
    console.error('Get all scholarships error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get scholarships',
      error: error.message
    });
  }
};

/**
 * Get a single scholarship by ID - Admin view
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log the request for debugging
    console.log(`Admin requesting scholarship ID: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scholarship ID format'
      });
    }
    
    // Populate creator details for better admin view
    const scholarship = await Scholarship.findById(id)
      .populate('createdBy', 'firstName lastName email role organizationName');
    
    if (!scholarship) {
      console.log(`Admin requested non-existent scholarship: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    console.log(`Admin found scholarship: ${scholarship.title}, status: ${scholarship.status}`);
    
    // Format creator info
    let creatorInfo = 'Unknown';
    if (scholarship.createdBy) {
      if (scholarship.createdBy.role === 'donor' && scholarship.createdBy.organizationName) {
        creatorInfo = {
          id: scholarship.createdBy._id,
          name: scholarship.createdBy.organizationName,
          email: scholarship.createdBy.email,
          role: scholarship.createdBy.role
        };
      } else {
        creatorInfo = {
          id: scholarship.createdBy._id,
          name: `${scholarship.createdBy.firstName} ${scholarship.createdBy.lastName}`,
          email: scholarship.createdBy.email,
          role: scholarship.createdBy.role
        };
      }
    }
    
    return res.status(200).json({
      success: true,
      scholarship: {
        ...scholarship.toObject(),
        creator: creatorInfo
      }
    });
  } catch (error) {
    console.error('Get scholarship by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get scholarship details',
      error: error.message
    });
  }
};

/**
 * Delete scholarship
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if scholarship exists
    const scholarship = await Scholarship.findById(id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    // Delete scholarship
    await Scholarship.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete scholarship',
      error: error.message
    });
  }
};

/**
 * Review scholarship created by donor
 * @route PUT /api/admin/scholarships/:id/review
 * @access Private (Admin only)
 */
exports.reviewScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user._id; // Changed from userId to _id to match the actual user ID
    
    console.log(`Reviewing scholarship ${id} with status ${status} by admin ${adminId}`);
    
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either approved or rejected'
      });
    }
    
    // Find scholarship
    const scholarship = await Scholarship.findById(id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    console.log(`Found scholarship: ${scholarship.title}, current status: ${scholarship.status}, visible: ${scholarship.visible}`);
    
    // Check if scholarship is pending approval
    if (scholarship.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only pending scholarships can be reviewed'
      });
    }
    
    // Find the creator (donor)
    const creator = await User.findById(scholarship.createdBy);
    
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship creator not found'
      });
    }
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Update scholarship
      if (status === 'approved') {
        console.log(`Setting scholarship ${id} to active and visible`);
        scholarship.status = 'active';
        scholarship.visible = true;
        scholarship.approvedBy = adminId;
        scholarship.approvedAt = new Date();
      } else {
        console.log(`Setting scholarship ${id} to rejected`);
        scholarship.status = 'rejected';
        scholarship.rejectionReason = rejectionReason;
        scholarship.approvedBy = adminId;
        scholarship.approvedAt = new Date();
      }
      
      await scholarship.save({ session });
      
      console.log(`Scholarship updated: status=${scholarship.status}, visible=${scholarship.visible}`);
      
      // Double-check the update took effect
      const updatedScholarship = await Scholarship.findById(id);
      console.log(`Verification - scholarship after save: status=${updatedScholarship.status}, visible=${updatedScholarship.visible}`);
      
      // Create notification for creator
      const notification = new Notification({
        recipient: creator._id,
        title: status === 'approved' ? 'Scholarship Approved' : 'Scholarship Rejected',
        message: status === 'approved' 
          ? `Your scholarship "${scholarship.title}" has been approved and is now live.`
          : `Your scholarship "${scholarship.title}" was not approved. Reason: ${rejectionReason || 'No reason provided'}`,
        type: status === 'approved' ? 'success' : 'warning',
        relatedTo: {
          model: 'Scholarship',
          id: scholarship._id
        }
      });
      
      await notification.save({ session });
      
      // Send email notification to creator
      const emailService = require('../services/emailService');
      
      if (status === 'approved') {
        await emailService.sendScholarshipApprovedEmail(creator.email, scholarship.title);
      } else {
        await emailService.sendScholarshipRejectedEmail(creator.email, scholarship.title, rejectionReason);
      }
      
      // Log admin activity
      const admin = await Admin.findById(adminId);
      
      if (admin) {
        try {
          // Use 'review_scholarship' as the action which is in the enum
          admin.activities.push({
            action: 'review_scholarship',
            details: {
              scholarshipId: scholarship._id,
              title: scholarship.title,
              creatorId: creator._id,
              decision: status // Add the decision as a detail rather than in the action
            },
            timestamp: new Date()
          });
          
          await admin.save({ session });
          console.log('Admin activity logged successfully');
        } catch (activityError) {
          console.error('Error logging admin activity:', activityError);
          // Continue with transaction even if activity logging fails
        }
      }
      
      // Commit transaction
      await session.commitTransaction();
      
      // Verify the scholarship status after transaction is committed
      const verifiedScholarship = await Scholarship.findById(id);
      console.log(`Final verification after transaction: status=${verifiedScholarship.status}, visible=${verifiedScholarship.visible}`);
      
      return res.status(200).json({
        success: true,
        message: `Scholarship ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        scholarship: verifiedScholarship
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  } catch (error) {
    console.error('Error reviewing scholarship:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review scholarship',
      error: error.message
    });
  }
};

/**
 * Fix incorrectly configured scholarships
 * @route POST /api/admin/scholarships/fix
 * @access Private (Admin only)
 */
exports.fixScholarships = async (req, res) => {
  try {
    // Ensure the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }
    
    console.log('Starting scholarship repair process from admin controller');
    
    // Use the static method we added to the Scholarship model
    const fixResults = await Scholarship.fixAllScholarships();
    
    console.log('Scholarship fix results:', fixResults);
    
    // Log admin activity
    const admin = await Admin.findById(req.user._id);
    if (admin) {
      try {
        admin.activities.push({
          action: 'other',
          details: {
            action: 'fix_scholarships',
            fixedCount: fixResults.totalFixed
          },
          timestamp: new Date()
        });
        
        await admin.save();
      } catch (activityError) {
        console.error('Error logging admin activity:', activityError);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Scholarship fix completed',
      fixed: {
        activeFixCount: fixResults.activeFixed,
        approvedFixCount: fixResults.approvedFixed,
        totalFixed: fixResults.totalFixed
      }
    });
  } catch (error) {
    console.error('Error fixing scholarships:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fix scholarships',
      error: error.message
    });
  }
}; 