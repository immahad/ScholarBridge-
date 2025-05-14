// backend/controllers/donorController.js
const Donor = require('../models/Donor');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const { processScholarshipPayment } = require('../database/transactions/paymentTransactions');
const { generatePaymentReport } = require('../services/reportService');
const mongoose = require('mongoose');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const User = require('../models/User');

/**
 * Helper function to sync User and Donor records
 */
async function syncUserDonorRecords(userId, donorId) {
  console.log('Syncing User and Donor records:', {
    userId: userId.toString(),
    donorId: donorId.toString(),
    timestamp: new Date().toISOString()
  });
  
  try {
    // Update User role if needed
    const user = await User.findById(userId);
    if (user && user.role !== 'donor') {
      user.role = 'donor';
      await user.save();
      console.log('Updated user role to donor:', {
        userId: user._id.toString(),
        email: user.email,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update Donor userId if needed
    const donor = await Donor.findById(donorId);
    if (donor && (!donor.userId || donor.userId.toString() !== userId.toString())) {
      donor.userId = userId;
      await donor.save();
      console.log('Updated donor userId:', {
        donorId: donor._id.toString(),
        userId: userId.toString(),
        timestamp: new Date().toISOString()
      });
    }
    
    return { user, donor };
  } catch (error) {
    console.error('Error syncing User and Donor records:', {
      error: error.message,
      stack: error.stack,
      userId: userId.toString(),
      donorId: donorId.toString(),
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Get donor profile
 * @route GET /api/donors/profile
 * @access Private (Donor only)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  console.log('Getting donor profile for user:', userId);
  
  // Find the donor by userId field, not by _id
  const donor = await Donor.findOne({ userId });
  
  if (!donor) {
    console.log(`Donor profile not found for user ${userId}`);
    throw createError('Donor profile not found', 404);
  }
  
  console.log(`Found donor profile: ${donor._id}`);
  
  res.status(200).json({
    success: true,
    donor
  });
});

/**
 * Update donor profile
 * @route PUT /api/donors/profile
 * @access Private (Donor only)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  console.log('Updating donor profile for user:', userId);
  
  // Get profile data from request body
  const {
    firstName,
    lastName,
    phoneNumber,
    donorType,
    organizationName,
    organizationRole,
    address,
    taxId,
    preferredCauses,
    donationPreferences,
    websiteUrl,
    socialMedia,
    bio
  } = req.body;
  
  // Find and update donor by userId, not by _id
  const donor = await Donor.findOneAndUpdate(
    { userId },
    {
      firstName,
      lastName,
      phoneNumber,
      donorType,
      organizationName,
      organizationRole,
      address,
      taxId,
      preferredCauses,
      donationPreferences,
      websiteUrl,
      socialMedia,
      bio,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );
  
  if (!donor) {
    console.log(`Donor profile not found for user ${userId}`);
    throw createError('Donor profile not found', 404);
  }
  
  console.log(`Updated donor profile: ${donor._id}`);
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    donor
  });
});

/**
 * Get eligible students for donations
 * @route GET /api/donors/eligible-students
 * @access Private (Donor only)
 */
exports.getEligibleStudents = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Filter options
  const filter = { 'scholarshipApplications.status': 'approved' };
  
  // Institution filter
  if (req.query.institution) {
    filter.institution = { $regex: req.query.institution, $options: 'i' };
  }
  
  // Program filter
  if (req.query.program) {
    filter.program = { $regex: req.query.program, $options: 'i' };
  }
  
  // Use aggregation to get eligible students with their approved scholarships
  const students = await Student.aggregate([
    { $match: { profileCompleted: true } },
    { $unwind: '$scholarshipApplications' },
    { $match: { 'scholarshipApplications.status': 'approved' } },
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarship'
      }
    },
    { $unwind: '$scholarship' },
    { $match: { 'scholarship.status': 'active' } },
    { $sort: { 'scholarshipApplications.reviewedAt': -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        institution: 1,
        program: 1,
        currentYear: 1,
        expectedGraduationYear: 1,
        currentGPA: 1,
        application: '$scholarshipApplications',
        scholarship: {
          _id: '$scholarship._id',
          title: '$scholarship.title',
          amount: '$scholarship.amount',
          description: '$scholarship.description'
        }
      }
    }
  ]);
  
  // Get total count
  const totalCount = await Student.aggregate([
    { $match: { profileCompleted: true } },
    { $unwind: '$scholarshipApplications' },
    { $match: { 'scholarshipApplications.status': 'approved' } },
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarship'
      }
    },
    { $unwind: '$scholarship' },
    { $match: { 'scholarship.status': 'active' } },
    { $count: 'total' }
  ]);
  
  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  
  res.status(200).json({
    success: true,
    count: students.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    students
  });
});

/**
 * Get student details for donation
 * @route GET /api/donors/students/:id
 * @access Private (Donor only)
 */
exports.getStudentDetails = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  
  // Find student with approved applications
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student not found', 404);
  }
  
  // Get approved applications
  const approvedApplications = student.scholarshipApplications.filter(
    app => app.status === 'approved'
  );
  
  if (approvedApplications.length === 0) {
    throw createError('This student has no approved scholarship applications', 404);
  }
  
  // Get scholarship details for each application
  const applicationsWithScholarships = await Promise.all(
    approvedApplications.map(async (app) => {
      const scholarship = await Scholarship.findById(app.scholarshipId);
      
      return {
        ...app.toObject(),
        scholarship: scholarship ? {
          _id: scholarship._id,
          title: scholarship.title,
          amount: scholarship.amount,
          description: scholarship.description
        } : null
      };
    })
  );
  
  // Prepare student data (excluding sensitive information)
  const studentData = {
    _id: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    institution: student.institution,
    program: student.program,
    currentYear: student.currentYear,
    expectedGraduationYear: student.expectedGraduationYear,
    currentGPA: student.currentGPA,
    bio: student.bio,
    approvedApplications: applicationsWithScholarships
  };
  
  res.status(200).json({
    success: true,
    student: studentData
  });
});

/**
 * Make a donation
 * @route POST /api/donors/donate
 * @access Private (Donor only)
 */
exports.makeDonation = asyncHandler(async (req, res) => {
  const donorId = req.user._id;
  
  // Get donation data from request body
  const {
    scholarshipId,
    studentId,
    amount,
    paymentMethod,
    transactionId,
    notes,
    isAnonymous
  } = req.body;
  
  // Validate donation amount
  if (!amount || amount <= 0) {
    throw createError('Donation amount must be positive', 400);
  }
  
  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create payment
    const paymentData = {
      donorId,
      studentId,
      scholarshipId,
      amount,
      paymentMethod,
      transactionId,
      status: 'completed',
      notes,
      isAnonymous,
      completedDate: new Date()
    };
    
    // Use the static method that handles all the operations in a transaction
    const payment = await Payment.createPaymentWithTransaction(paymentData);
    
    // Commit transaction
    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      message: 'Donation made successfully',
      payment
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
 * Get donation history
 * @route GET /api/donors/donations
 * @access Private (Donor only)
 */
exports.getDonationHistory = asyncHandler(async (req, res) => {
  const donorId = req.user._id;
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Get donor with history
  const donor = await Donor.findById(donorId);
  
  if (!donor) {
    throw createError('Donor profile not found', 404);
  }
  
  // Get donations and sort by date
  const donations = donor.donationHistory
    .sort((a, b) => b.donationDate - a.donationDate)
    .slice(skip, skip + limit);
  
  // Get total count
  const total = donor.donationHistory.length;
  
  // Get additional details for each donation
  const donationsWithDetails = await Promise.all(
    donations.map(async (donation) => {
      // Get scholarship details
      const scholarship = await Scholarship.findById(donation.scholarshipId)
        .select('title');
      
      // Get student details
      const student = await Student.findById(donation.studentId)
        .select('firstName lastName institution program');
      
      return {
        ...donation.toObject(),
        scholarship: scholarship ? {
          _id: scholarship._id,
          title: scholarship.title
        } : null,
        student: student ? {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          institution: student.institution,
          program: student.program
        } : null
      };
    })
  );
  
  res.status(200).json({
    success: true,
    count: donations.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalDonated: donor.totalDonated,
    donations: donationsWithDetails
  });
});

/**
 * Get donation details
 * @route GET /api/donors/donations/:id
 * @access Private (Donor only)
 */
exports.getDonationDetails = asyncHandler(async (req, res) => {
  const donorId = req.user._id;
  const donationId = req.params.id;
  
  // Log the incoming request for debugging
  console.log(`Getting donation details: donorId=${donorId}, donationId=${donationId}`);
  
  // Find donor by user ID instead of donor ID directly
  const donor = await Donor.findOne({ userId: donorId });
  
  if (!donor) {
    console.log(`Donor not found for user: ${donorId}`);
    throw createError('Donor profile not found', 404);
  }
  
  // Find donation by ID
  const donation = donor.donationHistory.find(d => d._id.toString() === donationId);
  
  if (!donation) {
    console.log(`Donation ${donationId} not found for donor: ${donor._id}`);
    throw createError('Donation not found', 404);
  }
  
  // Get scholarship details
  let scholarship = null;
  if (donation.scholarshipId) {
    scholarship = await Scholarship.findById(donation.scholarshipId);
    console.log(`Found scholarship: ${scholarship ? scholarship._id : 'Not found'}`);
  }
  
  // Get student details and application
  let student = null;
  if (donation.studentId) {
    student = await Student.findById(donation.studentId);
    console.log(`Found student: ${student ? student._id : 'Not found'}`);
  }
  
  // Find the student's application for this scholarship
  let application = null;
  if (student && donation.scholarshipId) {
    application = student.scholarshipApplications.find(
      app => app.scholarshipId.toString() === donation.scholarshipId.toString()
    );
  }
  
  res.status(200).json({
    success: true,
    donation: {
      ...donation.toObject(),
      scholarship: scholarship ? {
        _id: scholarship._id,
        title: scholarship.title,
        amount: scholarship.amount,
        description: scholarship.description
      } : null,
      student: student ? {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        institution: student.institution,
        program: student.program
      } : null,
      application: application ? {
        _id: application._id,
        status: application.status,
        appliedAt: application.appliedAt,
        fundedAt: application.fundedAt
      } : null
    }
  });
});

/**
 * Get donor dashboard data
 * @route GET /api/donors/dashboard
 * @access Private (Donor only)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  console.log('Fetching dashboard for user:', {
    userId: userId.toString(),
    userObject: req.user,
    timestamp: new Date().toISOString()
  });
  
  try {
    // First try to find donor by userId
    let donor = await Donor.findOne({ userId });
    
    // If not found, try to find through recent payments
    if (!donor) {
      console.log('Donor not found by userId, checking recent payments...');
      const recentPayment = await Payment.findOne({})
        .sort({ createdAt: -1 })
        .limit(1);
      
      if (recentPayment) {
        console.log('Found recent payment:', {
          paymentId: recentPayment._id.toString(),
          donorId: recentPayment.donorId.toString(),
          timestamp: new Date().toISOString()
        });
        
        // Try to sync records if we found a payment
        const { donor: syncedDonor } = await syncUserDonorRecords(userId, recentPayment.donorId);
        donor = syncedDonor;
      }
    }
    
    if (!donor) {
      console.error('Donor not found for user:', {
        userId: userId.toString(),
        timestamp: new Date().toISOString()
      });
      throw createError('Donor profile not found', 404);
    }
    
    console.log('Fetching dashboard for donor:', donor._id);
    console.log('Current totalDonated:', donor.totalDonated);
    console.log('Current donationHistory length:', donor.donationHistory.length);
    
    // Recalculate total just to be sure
    const calculatedTotal = donor.donationHistory.reduce((sum, donation) => {
      if (donation.status === 'completed') {
        return sum + (donation.amount || 0);
      }
      return sum;
    }, 0);
    
    console.log('Calculated total from history:', calculatedTotal);
    
    if (calculatedTotal !== donor.totalDonated) {
      console.log('Total mismatch detected. Updating donor...');
      donor.totalDonated = calculatedTotal;
      await donor.save();
    }
    
    // Get completed donations only
    const completedDonations = donor.donationHistory.filter(d => d.status === 'completed');
    
    // Donation summary
    const donationSummary = {
      totalDonated: donor.totalDonated,
      totalDonations: completedDonations.length,
      studentsHelped: new Set(completedDonations.map(d => d.studentId?.toString()).filter(Boolean)).size
    };
    
    console.log('Donation summary:', donationSummary);
    
    // Recent donations
    const recentDonations = await Promise.all(
      completedDonations
        .sort((a, b) => b.donationDate - a.donationDate)
        .slice(0, 5)
        .map(async (donation) => {
          console.log(`Processing donation ${donation._id}, scholarshipId: ${donation.scholarshipId || 'none'}, studentId: ${donation.studentId || 'none'}`);
          
          // Get scholarship details with better error handling
          let scholarship = null;
          if (donation.scholarshipId) {
            try {
              scholarship = await Scholarship.findById(donation.scholarshipId).select('title amount description');
              if (!scholarship) {
                console.log(`Warning: Scholarship ${donation.scholarshipId} not found for donation ${donation._id}`);
              }
            } catch (err) {
              console.error(`Error fetching scholarship for donation ${donation._id}:`, err.message);
            }
          }
          
          // For general donations (without scholarshipId), create a generic scholarship object
          if (!scholarship) {
            scholarship = {
              title: 'General Donation'
            };
          }
          
          // Get student details with better error handling
          let student = null;
          if (donation.studentId) {
            try {
              student = await Student.findById(donation.studentId).select('firstName lastName institution program');
              if (!student) {
                console.log(`Warning: Student ${donation.studentId} not found for donation ${donation._id}`);
              }
            } catch (err) {
              console.error(`Error fetching student for donation ${donation._id}:`, err.message);
            }
          }
          
          // For donations to the general fund (not to a specific student)
          // Use default values that make it clear this is a general donation
          if (!student) {
            student = { 
              firstName: 'General', 
              lastName: 'Fund',
              institution: 'ScholarBridge Foundation',
              program: 'General Support'
            };
          }
          
          // Create a detailed donation object
          return {
            _id: donation._id,
            amount: donation.amount,
            donationDate: donation.donationDate,
            paymentMethod: donation.paymentMethod,
            status: donation.status,
            isAnonymous: donation.isAnonymous,
            notes: donation.notes,
            scholarship: {
              _id: scholarship._id,
              title: scholarship.title,
              amount: scholarship.amount
            },
            student: {
              _id: student._id,
              firstName: student.firstName,
              lastName: student.lastName,
              institution: student.institution,
              program: student.program
            }
          };
        })
    );
    
    // Get monthly donation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Initialize monthly data with zeros
    const monthlyDonations = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        amount: 0
      };
    }).reverse();
    
    // Calculate monthly totals
    completedDonations.forEach(donation => {
      if (donation.donationDate >= sixMonthsAgo) {
        const monthIndex = monthlyDonations.findIndex(m => 
          m.month === donation.donationDate.toLocaleString('default', { month: 'short' })
        );
        if (monthIndex !== -1) {
          monthlyDonations[monthIndex].amount += donation.amount;
        }
      }
    });
    
    console.log('Monthly donation trends:', monthlyDonations);
    
    // Get count of eligible students (those with approved applications)
    const eligibleStudentsCount = await Student.countDocuments({
      'scholarshipApplications.status': 'approved',
      profileCompleted: true
    });
    
    console.log('Eligible students count:', eligibleStudentsCount);
    
    res.status(200).json({
      success: true,
      donationSummary,
      recentDonations,
      monthlyDonations,
      eligibleStudentsCount
    });
  } catch (error) {
    console.error('Error fetching donor dashboard:', {
      error: error.message,
      stack: error.stack,
      userId: userId.toString(),
      timestamp: new Date().toISOString()
    });
    throw error;
  }
});

/**
 * Generate donation report
 * @route POST /api/donors/reports
 * @access Private (Donor only)
 */
exports.generateReport = asyncHandler(async (req, res) => {
  const donorId = req.user._id;
  
  // Get report parameters
  const { startDate, endDate, includeStudentDetails } = req.body;
  
  // Find donor
  const donor = await Donor.findById(donorId);
  
  if (!donor) {
    throw createError('Donor profile not found', 404);
  }
  
  // Filter donations by date range
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  
  const filteredDonations = donor.donationHistory.filter(
    donation => {
      const donationDate = new Date(donation.donationDate);
      return donationDate >= start && donationDate <= end;
    }
  );
  
  // Sort donations by date
  filteredDonations.sort((a, b) => b.donationDate - a.donationDate);
  
  // Generate donation details
  const donationsWithDetails = await Promise.all(
    filteredDonations.map(async (donation) => {
      // Get scholarship details
      const scholarship = await Scholarship.findById(donation.scholarshipId)
        .select('title amount');
      
      let studentDetails = null;
      
      // Get student details if requested
      if (includeStudentDetails) {
        const student = await Student.findById(donation.studentId)
          .select('firstName lastName institution program');
        
        if (student) {
          studentDetails = {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            institution: student.institution,
            program: student.program
          };
        }
      }
      
      return {
        _id: donation._id,
        amount: donation.amount,
        donationDate: donation.donationDate,
        paymentMethod: donation.paymentMethod,
        status: donation.status,
        notes: donation.notes,
        scholarship: scholarship ? {
          _id: scholarship._id,
          title: scholarship.title,
          amount: scholarship.amount
        } : null,
        student: studentDetails
      };
    })
  );
  
  // Calculate summary statistics
  const summary = {
    totalDonations: filteredDonations.length,
    totalAmount: filteredDonations.reduce((sum, d) => sum + d.amount, 0),
    startDate: start,
    endDate: end,
    generatedAt: new Date()
  };
  
  // Generate report
  const report = {
    donor: {
      _id: donor._id,
      firstName: donor.firstName,
      lastName: donor.lastName,
      organizationName: donor.organizationName,
      donorType: donor.donorType
    },
    summary,
    donations: donationsWithDetails
  };
  
  res.status(200).json({
    success: true,
    report
  });
});