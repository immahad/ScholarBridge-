const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * Review scholarship application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.reviewApplication = async (req, res) => {
  try {
    const { studentId, applicationId } = req.params;
    const { status, comments } = req.body;
    const adminId = req.user.userId;
    
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status'
      });
    }
    
    // Find student and application
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find the application
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app._id.toString() === applicationId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Update application status
    const application = student.scholarshipApplications[applicationIndex];
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be reviewed'
      });
    }
    
    // Update application
    application.status = status;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    application.comments = comments;
    
    // Save changes
    await student.save();
    
    // Get the scholarship details
    const scholarship = await Scholarship.findById(application.scholarshipId);
    
    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application: {
        ...application.toObject(),
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          institution: student.institution,
          program: student.program
        },
        scholarship: scholarship ? {
          _id: scholarship._id,
          title: scholarship.title,
          amount: scholarship.amount
        } : null
      }
    });
  } catch (error) {
    console.error('Review application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review application',
      error: error.message
    });
  }
};

/**
 * Get applications by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    if (!['pending', 'approved', 'rejected', 'funded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status'
      });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Use aggregation to get applications with student and scholarship details
    const applications = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications.status': status } },
      { $sort: { 'scholarshipApplications.createdAt': -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'scholarships',
          localField: 'scholarshipApplications.scholarshipId',
          foreignField: '_id',
          as: 'scholarship'
        }
      },
      {
        $project: {
          studentId: '$_id',
          firstName: 1,
          lastName: 1,
          email: 1,
          institution: 1,
          program: 1,
          application: '$scholarshipApplications',
          scholarshipId: { $arrayElemAt: ['$scholarship._id', 0] },
          scholarshipTitle: { $arrayElemAt: ['$scholarship.title', 0] },
          scholarshipAmount: { $arrayElemAt: ['$scholarship.amount', 0] }
        }
      }
    ]);
    
    // Get total count
    const totalCount = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications.status': status } },
      { $count: 'total' }
    ]);
    
    const total = totalCount.length > 0 ? totalCount[0].total : 0;
    
    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      applications
    });
  } catch (error) {
    console.error('Get applications by status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: error.message
    });
  }
};

/**
 * Get applications for admin dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboardApplications = async (req, res) => {
  try {
    // Get recent applications with all statuses for admin dashboard
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
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          institution: 1,
          program: 1,
          applicationId: '$scholarshipApplications._id',
          applicationDate: '$scholarshipApplications.appliedAt',
          scholarshipId: { $arrayElemAt: ['$scholarship._id', 0] },
          scholarshipTitle: { $arrayElemAt: ['$scholarship.title', 0] },
          scholarshipAmount: { $arrayElemAt: ['$scholarship.amount', 0] },
          status: '$scholarshipApplications.status',
          reviewedAt: '$scholarshipApplications.reviewedAt',
          reviewedBy: '$scholarshipApplications.reviewedBy'
        }
      }
    ]);
    
    // Get counts for each status
    const [pendingCount, approvedCount, rejectedCount, fundedCount] = await Promise.all([
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'pending' } },
        { $count: 'count' }
      ]),
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'approved' } },
        { $count: 'count' }
      ]),
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'rejected' } },
        { $count: 'count' }
      ]),
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'funded' } },
        { $count: 'count' }
      ])
    ]);
    
    return res.status(200).json({
      success: true,
      recentApplications,
      counts: {
        pending: pendingCount.length > 0 ? pendingCount[0].count : 0,
        approved: approvedCount.length > 0 ? approvedCount[0].count : 0,
        rejected: rejectedCount.length > 0 ? rejectedCount[0].count : 0,
        funded: fundedCount.length > 0 ? fundedCount[0].count : 0
      }
    });
  } catch (error) {
    console.error('Get dashboard applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get dashboard applications',
      error: error.message
    });
  }
}; 