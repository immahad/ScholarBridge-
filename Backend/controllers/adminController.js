const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Scholarship = require('../models/Scholarship');
const Payment = require('../models/Payment');
const { generateSystemReport } = require('../services/reportService');
const userTransactions = require('../database/transactions/userTransactions');

/**
 * Get admin dashboard data with analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get admin profile
    const admin = await Admin.findOne({ userId });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    // Get quick stats
    const [
      totalStudents,
      totalDonors,
      totalScholarships,
      pendingApplications,
      approvedApplications,
      fundedApplications,
      totalDonations
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'donor', isActive: true }),
      Scholarship.countDocuments(),
      // Get applications by status using aggregation
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
        { $match: { 'scholarshipApplications.status': 'funded' } },
        { $count: 'count' }
      ]),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Extract counts from aggregation results
    const stats = {
      totalStudents,
      totalDonors,
      totalScholarships,
      pendingApplicationsCount: pendingApplications.length > 0 ? pendingApplications[0].count : 0,
      approvedApplicationsCount: approvedApplications.length > 0 ? approvedApplications[0].count : 0,
      fundedApplicationsCount: fundedApplications.length > 0 ? fundedApplications[0].count : 0,
      totalDonationsAmount: totalDonations.length > 0 ? totalDonations[0].total : 0
    };
    
    // Get monthly user growth data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const studentGrowth = await User.aggregate([
      { 
        $match: { 
          role: 'student',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const donorGrowth = await User.aggregate([
      { 
        $match: { 
          role: 'donor',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format growth chart data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthChartData = [];
    
    // Initialize data for past 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const year = d.getFullYear();
      const month = d.getMonth();
      
      growthChartData.push({
        month: `${months[month]} ${year}`,
        students: 0,
        donors: 0
      });
    }
    
    // Fill in student data
    studentGrowth.forEach(item => {
      const monthIndex = item._id.month - 1;
      const year = item._id.year;
      const monthLabel = `${months[monthIndex]} ${year}`;
      
      const existingEntry = growthChartData.find(entry => entry.month === monthLabel);
      if (existingEntry) {
        existingEntry.students = item.count;
      }
    });
    
    // Fill in donor data
    donorGrowth.forEach(item => {
      const monthIndex = item._id.month - 1;
      const year = item._id.year;
      const monthLabel = `${months[monthIndex]} ${year}`;
      
      const existingEntry = growthChartData.find(entry => entry.month === monthLabel);
      if (existingEntry) {
        existingEntry.donors = item.count;
      }
    });
    
    // Get recent applications for review
    const recentApplications = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications.status': 'pending' } },
      { $sort: { 'scholarshipApplications.createdAt': -1 } },
      { $limit: 5 },
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
          applicationDate: '$scholarshipApplications.createdAt',
          scholarshipId: { $arrayElemAt: ['$scholarship._id', 0] },
          scholarshipTitle: { $arrayElemAt: ['$scholarship.title', 0] }
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      },
      stats,
      growthChartData,
      recentApplications
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

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
    const { title, description, amount, criteria, deadlineDate, status } = req.body;
    
    // Find and update scholarship
    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      {
        title,
        description,
        amount,
        criteria,
        deadlineDate,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
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
 * Get a single scholarship by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findById(id)
      .populate('createdBy', 'firstName lastName');
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      scholarship
    });
  } catch (error) {
    console.error('Get scholarship by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get scholarship',
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
 * Get all payments/donations with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPayments = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    
    // Date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get payments with donor and scholarship details
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName organizationName donorType')
      .populate('scholarshipId', 'title');
    
    // Get total count
    const total = await Payment.countDocuments(filter);
    
    // Calculate total amount
    const totalAmount = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

/**
 * Generate system report with analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    // Validate report type
    if (!['users', 'scholarships', 'donations', 'applications', 'comprehensive'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }
    
    // Validate date range
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Generate report using the service - pass options as an object
    const report = await generateSystemReport({
      reportType,
      startDate: start, 
      endDate: end
    });
    
    return res.status(200).json({
      success: true,
      reportType,
      report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

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
    
    // Calculate statistics for the dashboard
    const [
      totalStudents,
      totalDonors,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      fundedStudents,
      activeDonors,
      totalDonations
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'donor', isActive: true }),
      Student.aggregate([
        { $unwind: { path: '$scholarshipApplications', preserveNullAndEmptyArrays: true } },
        { $match: { 'scholarshipApplications.status': 'pending' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $count: 'total' }
      ]),
      Student.aggregate([
        { $unwind: { path: '$scholarshipApplications', preserveNullAndEmptyArrays: true } },
        { $match: { 'scholarshipApplications.status': 'approved' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $count: 'total' }
      ]),
      Student.aggregate([
        { $unwind: { path: '$scholarshipApplications', preserveNullAndEmptyArrays: true } },
        { $match: { 'scholarshipApplications.status': 'rejected' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $count: 'total' }
      ]),
      Student.aggregate([
        { $unwind: { path: '$scholarshipApplications', preserveNullAndEmptyArrays: true } },
        { $match: { 'scholarshipApplications.paymentId': { $exists: true, $ne: null } } },
        { $group: { _id: '$userId' } },
        { $count: 'total' }
      ]),
      Donor.countDocuments({ 'donations.0': { $exists: true } }),
      Donor.aggregate([
        { $unwind: { path: '$donations', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: '$donations.amount' } } }
      ])
    ]);
    
    const statistics = {
      totalStudents,
      pendingStudents: pendingApplications[0]?.total || 0,
      approvedStudents: approvedApplications[0]?.total || 0,
      rejectedStudents: rejectedApplications[0]?.total || 0,
      fundedStudents: fundedStudents[0]?.total || 0,
      totalDonors,
      activeDonors,
      totalDonations: totalDonations[0]?.total || 0
    };
    
    return res.status(200).json({
      success: true,
      count: enhancedUsers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users: enhancedUsers,
      statistics
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
 * Deactivate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and deactivate user
    const user = await User.findByIdAndUpdate(
      id,
      {
        isActive: false,
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

/**
 * Activate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and activate user
    const user = await User.findByIdAndUpdate(
      id,
      {
        isActive: true,
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
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });  }
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
 * Get admin activity log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getActivityLog = async (req, res) => {
  try {
    // This would typically come from an ActivityLog model
    // For now, returning a placeholder response
    return res.status(200).json({
      success: true,
      message: 'Activity log feature to be implemented',
      activities: []
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
