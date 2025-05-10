// backend/controllers/donorController.js
const Donor = require('../models/Donor');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const { processScholarshipPayment } = require('../database/transactions/paymentTransactions');
const { generatePaymentReport } = require('../services/reportService');
const mongoose = require('mongoose');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/**
 * Get donor profile
 * @route GET /api/donors/profile
 * @access Private (Donor only)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const donorId = req.user._id;
  
  const donor = await Donor.findById(donorId);
  
  if (!donor) {
    throw createError('Donor profile not found', 404);
  }
  
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
  const donorId = req.user._id;
  
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
  
  // Find and update donor
  const donor = await Donor.findByIdAndUpdate(
    donorId,
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
    throw createError('Donor profile not found', 404);
  }
  
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
  
  // Find donor
  const donor = await Donor.findById(donorId);
  
  if (!donor) {
    throw createError('Donor profile not found', 404);
  }
  
  // Find donation
  const donation = donor.donationHistory.id(donationId);
  
  if (!donation) {
    throw createError('Donation not found', 404);
  }
  
  // Get scholarship details
  const scholarship = await Scholarship.findById(donation.scholarshipId);
  
  // Get student details and application
  const student = await Student.findById(donation.studentId);
  
  // Find the student's application for this scholarship
  let application = null;
  
  if (student) {
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
  const donorId = req.user._id;
  
  // Find donor
  const donor = await Donor.findById(donorId);
  
  if (!donor) {
    throw createError('Donor profile not found', 404);
  }
  
  // Donation summary
  const donationSummary = {
    totalDonated: donor.totalDonated,
    totalDonations: donor.donationHistory.length,
    studentsHelped: new Set(donor.donationHistory.map(d => d.studentId.toString())).size
  };
  
  // Recent donations
  const recentDonations = await Promise.all(
    donor.donationHistory
      .sort((a, b) => b.donationDate - a.donationDate)
      .slice(0, 5)
      .map(async (donation) => {
        // Get scholarship details
        const scholarship = await Scholarship.findById(donation.scholarshipId)
          .select('title');
        
        // Get student details
        const student = await Student.findById(donation.studentId)
          .select('firstName lastName institution program');
        
        return {
          _id: donation._id,
          amount: donation.amount,
          donationDate: donation.donationDate,
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
  
  // Get monthly donation trends (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Initialize monthly data with zeros
  const monthlyDonations = [];
  
  // Create array with last 6 months
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    
    monthlyDonations.unshift({
      month: `${month + 1}/${year}`,
      amount: 0,
      count: 0
    });
  }
  
  // Fill in donation data
  donor.donationHistory.forEach(donation => {
    const donationDate = new Date(donation.donationDate);
    const donationYear = donationDate.getFullYear();
    const donationMonth = donationDate.getMonth();
    
    // Check if donation is within the last 6 months
    if (donationDate >= sixMonthsAgo) {
      const monthIndex = monthlyDonations.findIndex(
        m => m.month === `${donationMonth + 1}/${donationYear}`
      );
      
      if (monthIndex !== -1) {
        monthlyDonations[monthIndex].amount += donation.amount;
        monthlyDonations[monthIndex].count += 1;
      }
    }
  });
  
  // Get count of eligible students for donations
  const eligibleStudentsCount = await Student.countDocuments({
    'scholarshipApplications.status': 'approved'
  });
  
  res.status(200).json({
    success: true,
    donationSummary,
    recentDonations,
    monthlyDonations,
    eligibleStudentsCount
  });
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