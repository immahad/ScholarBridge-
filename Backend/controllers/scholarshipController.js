const Scholarship = require('../models/Scholarship');
const Student = require('../models/Student');
const mongoose = require('mongoose');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Get all scholarships (with filtering, sorting and pagination)
 * @route GET /api/scholarships
 * @access Public
 */
exports.getAllScholarships = asyncHandler(async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Fetch only public and active scholarships
    const scholarships = await Scholarship.find({ 
      visible: true, 
      status: 'active',
      deadlineDate: { $gt: new Date() }
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); 
    
    // Get total count for pagination
    const total = await Scholarship.countDocuments({ 
      visible: true, 
      status: 'active',
      deadlineDate: { $gt: new Date() }
    });
    
    res.status(200).json({
      success: true,
      count: scholarships.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      scholarships,
    });
  } catch (error) {
    console.error('Error fetching public scholarships:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get scholarship by ID
 * @route GET /api/scholarships/:id
 * @access Public
 */
exports.getScholarshipById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid ObjectId format: ${id}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid scholarship ID format'
    });
  }
  
  console.log(`Attempting to find scholarship with ID: ${id}`);
  
  try {
    // Find the scholarship without any status or visibility filters
    const scholarship = await Scholarship.findById(id).populate('createdBy', 'firstName lastName email organizationName');
    
    if (!scholarship) {
      console.error(`Scholarship not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    console.log(`Found scholarship: ${scholarship.title}, status: ${scholarship.status}`);
    
    // Check if the user has access (admin or owner)
    // The middleware isDonorOrOwner should have already verified this
    // But we still need to format the response correctly
    
    // Get the creator name
    let createdByName = 'Unknown';
    if (scholarship.createdBy) {
      if (scholarship.createdBy.organizationName) {
        createdByName = scholarship.createdBy.organizationName;
      } else {
        createdByName = `${scholarship.createdBy.firstName} ${scholarship.createdBy.lastName}`;
      }
    }
    
    // Return the scholarship with creator name
    return res.status(200).json({
      success: true,
      scholarship: {
        ...scholarship.toObject(),
        createdByName
      }
    });
  } catch (error) {
    console.error(`Error fetching scholarship with ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving scholarship details',
      error: error.message
    });
  }
});

/**
 * Get pending scholarships for admin review
 * @route GET /api/scholarships/pending
 * @access Private (Admin only)
 */
exports.getPendingScholarships = asyncHandler(async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    console.log('Looking for pending scholarships with status: pending_approval');
    
    // Fetch pending scholarships with creator details
    const scholarships = await Scholarship.find({ status: 'pending_approval' })
      .populate('createdBy', 'firstName lastName email role organizationName')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${scholarships.length} pending scholarships`);
    if (scholarships.length > 0) {
      console.log('Scholarship IDs:', scholarships.map(s => s._id));
    }
    
    // Format response
    const formattedScholarships = scholarships.map(scholarship => ({
      _id: scholarship._id,
      title: scholarship.title,
      amount: scholarship.amount,
      description: scholarship.description,
      deadlineDate: scholarship.deadlineDate,
      category: scholarship.category,
      createdBy: scholarship.createdBy ? {
        _id: scholarship.createdBy._id,
        name: scholarship.createdBy.firstName + ' ' + scholarship.createdBy.lastName,
        email: scholarship.createdBy.email,
        organizationName: scholarship.createdBy.organizationName
      } : 'Unknown',
      createdAt: scholarship.createdAt,
      status: scholarship.status
    }));
    
    res.status(200).json({
      success: true,
      count: formattedScholarships.length,
      scholarships: formattedScholarships
    });
  } catch (error) {
    console.error('Error fetching pending scholarships:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve pending scholarships',
      error: error.message
    });
  }
});

/**
 * Create new scholarship
 * @route POST /api/scholarships
 * @access Private (Admin and Donor)
 */
exports.createScholarship = async (req, res) => {
  try {
    console.log('DEBUG: Incoming scholarship creation body:', req.body);
    console.log('DEBUG: User info:', {
      userId: req.user._id,
      role: req.user.role,
      email: req.user.email
    });

    const {
      name,
      title,
      description,
      amount,
      deadline,
      category,
      eligibilityRequirements,
      criteria
    } = req.body;

    const scholarshipTitle = title || name; // Map 'name' to 'title' if 'title' is missing
    const scholarshipDeadline = deadline; // Use 'deadline' as 'deadlineDate'

    if (
      !scholarshipTitle ||
      !description ||
      !amount ||
      !scholarshipDeadline ||
      !category ||
      !eligibilityRequirements ||
      typeof eligibilityRequirements !== 'string' ||
      eligibilityRequirements.trim() === ''
    ) {
      return res.status(400).json({
        message: 'All fields are required',
        received: req.body
      });
    }
    
    // Force revalidate user role from the database to ensure it's accurate
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(401).json({
        message: 'User not found'
      });
    }
    
    // Use the freshly retrieved user role
    const isAdmin = currentUser.role === 'admin';
    const status = isAdmin ? 'active' : 'pending_approval';
    const visible = isAdmin ? true : false;
    
    console.log('DEBUG: Setting scholarship properties:', {
      isAdmin,
      status,
      visible,
      role: currentUser.role,
      originalRole: req.user.role
    });
    
    // Process criteria fields
    const scholarshipCriteria = {
      minGPA: criteria?.minGPA || 0,
      requiredDocuments: criteria?.requiredDocuments || ['cv', 'resume', 'id'],
      eligibleInstitutions: criteria?.eligibleInstitutions || [],
      eligiblePrograms: criteria?.eligiblePrograms || [],
      additionalCriteria: criteria?.additionalCriteria || []
    };

    const newScholarship = new Scholarship({
      title: scholarshipTitle,
      description,
      amount,
      deadlineDate: scholarshipDeadline, // Map 'deadline' to 'deadlineDate'
      category,
      eligibilityRequirements,
      criteria: scholarshipCriteria, // Add criteria fields
      createdBy: req.user._id,
      // If admin creates scholarship, make it active and visible directly
      status,
      visible
    });

    await newScholarship.save();
    
    console.log('DEBUG: Saved scholarship:', {
      _id: newScholarship._id,
      title: newScholarship.title,
      status: newScholarship.status,
      visible: newScholarship.visible,
      criteria: newScholarship.criteria
    });

    // If donor created scholarship, create notification for admin
    if (currentUser.role === 'donor') {
      // Find admins to notify
      const admins = await Admin.find({});
      
      if (admins.length > 0) {
        const notifications = admins.map(admin => ({
          recipient: admin._id,
          title: 'New Scholarship for Review',
          message: `A new scholarship "${scholarshipTitle}" has been created by a donor and needs your review.`,
          type: 'info',
          relatedTo: {
            model: 'Scholarship',
            id: newScholarship._id
          }
        }));
        
        await Notification.insertMany(notifications);
      }
      
      // Create notification for donor
      await Notification.create({
        recipient: req.user._id,
        title: 'Scholarship Submitted for Review',
        message: `Your scholarship "${scholarshipTitle}" has been submitted for admin review. You will be notified once it's approved.`,
        type: 'info',
        relatedTo: {
          model: 'Scholarship',
          id: newScholarship._id
        }
      });
    }

    res.status(201).json({
      message: currentUser.role === 'admin' 
        ? 'Scholarship created successfully' 
        : 'Scholarship submitted for admin approval',
      scholarship: newScholarship
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Update scholarship
 * @route PUT /api/scholarships/:id
 * @access Private (Admin only)
 */
exports.updateScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get scholarship data from request body
  const {
    title,
    description,
    amount,
    criteria,
    deadlineDate,
    category,
    tags,
    status,
    featuredRank,
    visible
  } = req.body;
  
  // Find and update scholarship
  const scholarship = await Scholarship.findByIdAndUpdate(
    id,
    {
      title,
      description,
      amount,
      criteria,
      deadlineDate,
      category,
      tags,
      status,
      featuredRank,
      visible
    },
    { new: true, runValidators: true }
  );
  
  if (!scholarship) {
    throw createError('Scholarship not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Scholarship updated successfully',
    scholarship
  });
});

/**
 * Delete scholarship
 * @route DELETE /api/scholarships/:id
 * @access Private (Admin only)
 */
exports.deleteScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if there are applications for this scholarship
  const hasApplications = await Student.exists({
    'scholarshipApplications.scholarshipId': mongoose.Types.ObjectId(id)
  });
  
  if (hasApplications) {
    // Set status to closed instead of deleting
    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      { status: 'closed', visible: false },
      { new: true }
    );
    
    if (!scholarship) {
      throw createError('Scholarship not found', 404);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Scholarship has applications and cannot be deleted. It has been closed instead.'
    });
  }
  
  // Delete scholarship if no applications
  const scholarship = await Scholarship.findByIdAndDelete(id);
  
  if (!scholarship) {
    throw createError('Scholarship not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Scholarship deleted successfully'
  });
});

/**
 * Get scholarships by category
 * @route GET /api/scholarships/category/:category
 * @access Public
 */
exports.getScholarshipsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Find scholarships by category
  const scholarships = await Scholarship.find({
    category,
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  })
    .sort({ featuredRank: -1, deadlineDate: 1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const total = await Scholarship.countDocuments({
    category,
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  });
  
  res.status(200).json({
    success: true,
    count: scholarships.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    scholarships
  });
});

/**
 * Get featured scholarships
 * @route GET /api/scholarships/featured
 * @access Public
 */
exports.getFeaturedScholarships = asyncHandler(async (req, res) => {
  // Get limit from query
  const limit = parseInt(req.query.limit) || 5;
  
  // Find featured scholarships
  const scholarships = await Scholarship.find({
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true,
    featuredRank: { $gt: 0 }
  })
    .sort({ featuredRank: -1 })
    .limit(limit);
  
  res.status(200).json({
    success: true,
    count: scholarships.length,
    scholarships
  });
});

/**
 * Get scholarship statistics
 * @route GET /api/scholarships/stats
 * @access Private (Admin only)
 */
exports.getScholarshipStats = asyncHandler(async (req, res) => {
  // Get overall scholarship statistics
  const stats = await Scholarship.getScholarshipStats();
  
  // Get category distribution
  const categoryDistribution = await Scholarship.getCategoryDistribution();
  
  // Get upcoming deadlines
  const upcomingDeadlines = await Scholarship.find({
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  })
    .sort({ deadlineDate: 1 })
    .limit(5)
    .select('title amount deadlineDate');
  
  res.status(200).json({
    success: true,
    stats,
    categoryDistribution,
    upcomingDeadlines
  });
});

/**
 * Get scholarship applications
 * @route GET /api/scholarships/:id/applications
 * @access Private (Admin only)
 */
exports.getScholarshipApplications = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Status filter
  const statusFilter = req.query.status ? { status: req.query.status } : {};
  
  // Find scholarship
  const scholarship = await Scholarship.findById(id);
  
  if (!scholarship) {
    throw createError('Scholarship not found', 404);
  }
  
  // Use aggregation to get applications with student details
  const applications = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.scholarshipId': mongoose.Types.ObjectId(id),
        ...statusFilter
      }
    },
    { $sort: { 'scholarshipApplications.appliedAt': -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        studentId: '$_id',
        firstName: 1,
        lastName: 1,
        institution: 1,
        program: 1,
        currentGPA: 1,
        application: '$scholarshipApplications'
      }
    }
  ]);
  
  // Get total count
  const totalCount = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.scholarshipId': mongoose.Types.ObjectId(id),
        ...statusFilter
      }
    },
    { $count: 'total' }
  ]);
  
  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  
  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    scholarship: {
      _id: scholarship._id,
      title: scholarship.title,
      amount: scholarship.amount,
      status: scholarship.status
    },
    applications
  });
});

/**
 * Get scholarships by donor
 * @route GET /api/scholarships/donor
 * @access Private (Donor only)
 */
exports.getScholarshipsByDonor = asyncHandler(async (req, res) => {
  try {
    const donorId = req.user._id; // Get the logged-in donor's ID
    
    // Fetch all scholarships created by this donor
    const scholarships = await Scholarship.find({ createdBy: donorId })
      .sort({ createdAt: -1 });
    
    // Organize scholarships by status
    const pendingScholarships = scholarships.filter(s => s.status === 'pending_approval');
    const activeScholarships = scholarships.filter(s => s.status === 'active');
    const rejectedScholarships = scholarships.filter(s => s.status === 'rejected');
    const closedScholarships = scholarships.filter(s => ['closed', 'expired'].includes(s.status));
    
    // Calculate statistics
    const stats = {
      total: scholarships.length,
      pending: pendingScholarships.length,
      active: activeScholarships.length,
      rejected: rejectedScholarships.length,
      closed: closedScholarships.length
    };
    
    res.status(200).json({
      success: true,
      stats,
      scholarships: {
        pending: pendingScholarships,
        active: activeScholarships,
        rejected: rejectedScholarships,
        closed: closedScholarships
      }
    });
  } catch (error) {
    console.error('Error fetching donor scholarships:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve scholarships'
    });
  }
});

/**
 * Review scholarship (approve or reject)
 * @route PUT /api/scholarships/:id/review
 * @access Private (Admin only)
 */
exports.reviewScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  
  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either approved or rejected'
    });
  }
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid scholarship ID'
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
  
  // Check if scholarship is in pending state
  if (scholarship.status !== 'pending_approval') {
    return res.status(400).json({
      success: false,
      message: 'Scholarship is not in pending state'
    });
  }
  
  // Update scholarship
  if (status === 'approved') {
    scholarship.status = 'active';
    scholarship.visible = true;
  } else {
    scholarship.status = 'rejected';
    scholarship.rejectionReason = reason;
  }
  
  scholarship.approvedBy = req.user._id;
  scholarship.approvedAt = new Date();
  
  await scholarship.save();
  
  // Notify the creator of the scholarship
  if (scholarship.createdBy) {
    await Notification.create({
      recipient: scholarship.createdBy,
      title: `Scholarship ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved' 
        ? `Your scholarship "${scholarship.title}" has been approved.` 
        : `Your scholarship "${scholarship.title}" has been rejected. Reason: ${reason || 'Not specified'}`,
      type: status === 'approved' ? 'success' : 'warning',
      relatedTo: {
        model: 'Scholarship',
        id: scholarship._id
      }
    });
  }
  
  // Log admin activity
  if (req.user && req.user.role === 'admin' && req.user._id) {
    try {
      const admin = await Admin.findById(req.user._id);
      
      if (admin && typeof admin.logActivity === 'function') {
        await admin.logActivity('review_scholarship', {
          scholarshipId: id,
          status,
          reason
        }, req);
      }
    } catch (logError) {
      console.error('Error logging admin activity:', logError);
      // Continue even if logging fails
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Scholarship ${status}`,
    scholarship
  });
});

/**
 * Fix for pending scholarship details display
 * This ensures that both the admin routes and regular scholarship routes
 * can properly handle the scholarship ID lookup
 */
exports.getPendingScholarshipDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid ObjectId format: ${id}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid scholarship ID format'
    });
  }
  
  console.log(`Attempting to find pending scholarship with ID: ${id}`);
  
  try {
    // Find the scholarship without any status or visibility filters
    const scholarship = await Scholarship.findById(id).populate('createdBy', 'firstName lastName email organizationName');
    
    if (!scholarship) {
      console.error(`Scholarship not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    console.log(`Found scholarship: ${scholarship.title}, status: ${scholarship.status}`);
    
    // Get the creator name
    let createdByName = 'Unknown';
    if (scholarship.createdBy) {
      if (scholarship.createdBy.organizationName) {
        createdByName = scholarship.createdBy.organizationName;
      } else {
        createdByName = `${scholarship.createdBy.firstName} ${scholarship.createdBy.lastName}`;
      }
    }
    
    return res.status(200).json({
      success: true,
      scholarship: {
        ...scholarship.toObject(),
        createdByName
      }
    });
  } catch (error) {
    console.error(`Error fetching scholarship with ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving scholarship details',
      error: error.message
    });
  }
});