const Scholarship = require('../models/Scholarship');
const Student = require('../models/Student');
const mongoose = require('mongoose');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/**
 * Get all scholarships (with filtering, sorting and pagination)
 * @route GET /api/scholarships
 * @access Public
 */
exports.getAllScholarships = asyncHandler(async (req, res) => {
  try {
    const scholarships = await Scholarship.find({ visible: true, status: 'active' }); // Fetch only public and active scholarships
    res.status(200).json({
      success: true,
      count: scholarships.length,
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
  
  const scholarship = await Scholarship.findById(id);
  
  if (!scholarship) {
    throw createError('Scholarship not found', 404);
  }
  
  // Check if scholarship is visible to public
  if (!scholarship.visible && (!req.user || req.user.role !== 'admin')) {
    throw createError('Scholarship not found', 404);
  }
  
  // For non-admin users, only active scholarships are visible
  if (scholarship.status !== 'active' && (!req.user || req.user.role !== 'admin')) {
    throw createError('Scholarship not found', 404);
  }
  
  res.status(200).json({
    success: true,
    scholarship
  });
});

/**
 * Create new scholarship
 * @route POST /api/scholarships
 * @access Private (Admin and Donor)
 */
exports.createScholarship = async (req, res) => {
  try {
    console.log('DEBUG: Incoming scholarship creation body:', req.body);

    const {
      name,
      title,
      description,
      amount,
      deadline,
      category,
      eligibilityRequirements
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

    const newScholarship = new Scholarship({
      title: scholarshipTitle,
      description,
      amount,
      deadlineDate: scholarshipDeadline, // Map 'deadline' to 'deadlineDate'
      category,
      eligibilityRequirements,
      createdBy: req.user._id,
    });

    await newScholarship.save();

    res.status(201).json({
      message: 'Scholarship created successfully',
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
    const scholarships = await Scholarship.find({ createdBy: donorId }); // Fetch scholarships created by this donor
    res.status(200).json({
      success: true,
      count: scholarships.length,
      scholarships,
    });
  } catch (error) {
    console.error('Error fetching donor scholarships:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});