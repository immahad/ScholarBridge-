const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/**
 * Get all applications across all scholarships (admin view)
 * @route GET /api/applications
 * @access Private (Admin only)
 */
exports.getAllApplications = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Filter parameters
  const statusFilter = req.query.status ? { 'scholarshipApplications.status': req.query.status } : {};
  
  // Use aggregation to get applications with student and scholarship details
  const applications = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    { $match: statusFilter },
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarship'
      }
    },
    { $unwind: '$scholarship' },
    { $sort: { 'scholarshipApplications.appliedAt': -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        applicationId: '$scholarshipApplications._id',
        studentId: '$_id',
        studentName: { $concat: ['$firstName', ' ', '$lastName'] },
        institution: 1,
        program: 1,
        currentGPA: 1,
        application: {
          status: '$scholarshipApplications.status',
          appliedAt: '$scholarshipApplications.appliedAt',
          reviewedAt: '$scholarshipApplications.reviewedAt',
          reviewedBy: '$scholarshipApplications.reviewedBy',
          fundedAt: '$scholarshipApplications.fundedAt',
          fundedBy: '$scholarshipApplications.fundedBy',
          comments: '$scholarshipApplications.comments'
        },
        scholarship: {
          _id: '$scholarship._id',
          title: '$scholarship.title',
          amount: '$scholarship.amount'
        }
      }
    }
  ]);
  
  // Get total count
  const totalCount = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    { $match: statusFilter },
    { $count: 'total' }
  ]);
  
  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  
  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    applications
  });
});

/**
 * Get application details
 * @route GET /api/applications/:id
 * @access Private (Admin only)
 */
exports.getApplicationDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Use aggregation to find the application by ID
  const applicationResults = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    { $match: { 'scholarshipApplications._id': mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarship'
      }
    },
    { $unwind: '$scholarship' }
  ]);
  
  if (applicationResults.length === 0) {
    throw createError('Application not found', 404);
  }
  
  const applicationData = applicationResults[0];
  
  // Get reviewer details if application was reviewed
  let reviewer = null;
  
  if (applicationData.scholarshipApplications.reviewedBy) {
    reviewer = await Admin.findById(applicationData.scholarshipApplications.reviewedBy)
      .select('firstName lastName');
  }
  
  // Get funder details if application was funded
  let funder = null;
  
  if (applicationData.scholarshipApplications.fundedBy) {
    funder = await mongoose.model('Donor').findById(applicationData.scholarshipApplications.fundedBy)
      .select('firstName lastName organizationName donorType');
  }
  
  // Format response
  const application = {
    applicationId: applicationData.scholarshipApplications._id,
    status: applicationData.scholarshipApplications.status,
    appliedAt: applicationData.scholarshipApplications.appliedAt,
    reviewedAt: applicationData.scholarshipApplications.reviewedAt,
    reviewedBy: applicationData.scholarshipApplications.reviewedBy,
    reviewer,
    fundedAt: applicationData.scholarshipApplications.fundedAt,
    fundedBy: applicationData.scholarshipApplications.fundedBy,
    funder,
    comments: applicationData.scholarshipApplications.comments,
    essays: applicationData.scholarshipApplications.essays,
    documents: applicationData.scholarshipApplications.documents
  };
  
  const student = {
    _id: applicationData._id,
    firstName: applicationData.firstName,
    lastName: applicationData.lastName,
    email: applicationData.email,
    institution: applicationData.institution,
    program: applicationData.program,
    currentYear: applicationData.currentYear,
    expectedGraduationYear: applicationData.expectedGraduationYear,
    currentGPA: applicationData.currentGPA,
    profileCompleted: applicationData.profileCompleted,
    financialInfo: applicationData.financialInfo,
    education: applicationData.education
  };
  
  const scholarship = {
    _id: applicationData.scholarship._id,
    title: applicationData.scholarship.title,
    description: applicationData.scholarship.description,
    amount: applicationData.scholarship.amount,
    deadlineDate: applicationData.scholarship.deadlineDate,
    criteria: applicationData.scholarship.criteria
  };
  
  res.status(200).json({
    success: true,
    application,
    student,
    scholarship
  });
});

/**
 * Review application (approve or reject)
 * @route PUT /api/applications/:id/review
 * @access Private (Admin only)
 */
exports.reviewApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;
  
  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    throw createError('Status must be either approved or rejected', 400);
  }
  
  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the student with the application
    const result = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications._id': mongoose.Types.ObjectId(id) } }
    ]);
    
    if (result.length === 0) {
      throw createError('Application not found', 404);
    }
    
    const { _id: studentId, scholarshipApplications } = result[0];
    const { scholarshipId } = scholarshipApplications;
    
    // Find student
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      throw createError('Student not found', 404);
    }
    
    // Find application in student's applications
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app._id.toString() === id
    );
    
    if (applicationIndex === -1) {
      throw createError('Application not found', 404);
    }
    
    // Update application
    student.scholarshipApplications[applicationIndex].status = status;
    student.scholarshipApplications[applicationIndex].reviewedBy = req.user._id;
    student.scholarshipApplications[applicationIndex].reviewedAt = new Date();
    student.scholarshipApplications[applicationIndex].comments = comments;
    
    await student.save({ session });
    
    // Update scholarship counts
    const scholarship = await Scholarship.findById(scholarshipId).session(session);
    
    if (scholarship) {
      if (status === 'approved') {
        scholarship.approvedCount += 1;
      }
      
      await scholarship.save({ session });
    }
    
    // Log admin activity
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user._id).session(session);
      
      if (admin) {
        await admin.logActivity('review_application', {
          applicationId: id,
          scholarshipId,
          studentId,
          status,
          comments
        }, req);
      }
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: `Application ${status}`,
      application: student.scholarshipApplications[applicationIndex]
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
});

/**
 * Get application statistics
 * @route GET /api/applications/stats
 * @access Private (Admin only)
 */
exports.getApplicationStats = asyncHandler(async (req, res) => {
  // Get status distribution
  const statusDistribution = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $group: {
        _id: '$scholarshipApplications.status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Get institution distribution
  const institutionDistribution = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $group: {
        _id: '$institution',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        institution: '$_id',
        count: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Get monthly application trends
  const currentYear = new Date().getFullYear();
  
  const monthlyTrends = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.appliedAt': {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$scholarshipApplications.appliedAt' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        month: '$_id',
        count: 1,
        _id: 0
      }
    },
    { $sort: { month: 1 } }
  ]);
  
  // Fill in missing months with zero counts
  const monthlyApplications = Array(12).fill().map((_, i) => ({
    month: i + 1,
    count: 0
  }));
  
  monthlyTrends.forEach(item => {
    monthlyApplications[item.month - 1].count = item.count;
  });
  
  // Get recent applications
  const recentApplications = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    { $sort: { 'scholarshipApplications.appliedAt': -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarship'
      }
    },
    { $unwind: '$scholarship' },
    {
      $project: {
        _id: 0,
        applicationId: '$scholarshipApplications._id',
        studentId: '$_id',
        studentName: { $concat: ['$firstName', ' ', '$lastName'] },
        institution: 1,
        status: '$scholarshipApplications.status',
        appliedAt: '$scholarshipApplications.appliedAt',
        scholarshipTitle: '$scholarship.title'
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    statusDistribution,
    institutionDistribution,
    monthlyApplications,
    recentApplications
  });
}); 