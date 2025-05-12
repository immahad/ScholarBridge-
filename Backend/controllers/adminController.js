const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Scholarship = require('../models/Scholarship');
const Payment = require('../models/Payment');
const { generateSystemReport } = require('../services/reportService');
const userTransactions = require('../database/transactions/userTransactions');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Import controllers
const applicationController = require('./adminApplicationController');
const scholarshipController = require('./adminScholarshipController');
const userController = require('./adminUserController');
const profileController = require('./adminProfileController');
const paymentController = require('./adminPaymentController');

// Re-export application functions
exports.reviewApplication = applicationController.reviewApplication;
exports.getApplicationsByStatus = applicationController.getApplicationsByStatus;

// Re-export scholarship functions
exports.createScholarship = scholarshipController.createScholarship;
exports.updateScholarship = scholarshipController.updateScholarship;
exports.getAllScholarships = scholarshipController.getAllScholarships;
exports.getScholarshipById = scholarshipController.getScholarshipById;
exports.deleteScholarship = scholarshipController.deleteScholarship;
exports.reviewScholarship = scholarshipController.reviewScholarship;

// Re-export user management functions
exports.activateUser = userController.activateUser;
exports.deactivateUser = userController.deactivateUser;
exports.getAllStudents = userController.getAllStudents;
exports.getAllDonors = userController.getAllDonors;
exports.getAllUsers = userController.getAllUsers;
exports.getUserById = userController.getUserById;
exports.updateUser = userController.updateUser;
exports.deleteUser = userController.deleteUser;
exports.getStudentById = userController.getStudentById;

// Re-export profile functions
exports.getProfile = profileController.getProfile;
exports.updateProfile = profileController.updateProfile;
exports.getActivityLog = profileController.getActivityLog;

// Re-export payment functions
exports.getAllPayments = paymentController.getAllPayments;
exports.generateReport = paymentController.generateReport;

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
