// backend/controllers/studentController.js
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const mongoose = require('mongoose');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/**
 * Get student profile
 * @route GET /api/students/profile
 * @access Private (Student only)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  res.status(200).json({
    success: true,
    student
  });
});

/**
 * Update student profile
 * @route PUT /api/students/profile
 * @access Private (Student only)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  // Get profile data from request body
  const {
    dateOfBirth,
    gender,
    institution,
    program,
    currentYear,
    expectedGraduationYear,
    currentGPA,
    address,
    financialInfo,
    bio
  } = req.body;
  
  // Find and update student
  const student = await Student.findByIdAndUpdate(
    studentId,
    {
      dateOfBirth,
      gender,
      institution,
      program,
      currentYear,
      expectedGraduationYear,
      currentGPA,
      address,
      financialInfo,
      bio,
      profileCompleted: true, // Mark profile as completed
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    student
  });
});

/**
 * Add education history
 * @route POST /api/students/education
 * @access Private (Student only)
 */
exports.addEducation = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  // Get education data from request body
  const {
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    isCurrentlyStudying,
    gpa,
    description
  } = req.body;
  
  // Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Add new education entry
  student.education.push({
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    isCurrentlyStudying,
    gpa,
    description
  });
  
  await student.save();
  
  res.status(201).json({
    success: true,
    message: 'Education history added successfully',
    education: student.education[student.education.length - 1]
  });
});

/**
 * Update education history
 * @route PUT /api/students/education/:id
 * @access Private (Student only)
 */
exports.updateEducation = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const educationId = req.params.id;
  
  // Get education data from request body
  const {
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    isCurrentlyStudying,
    gpa,
    description
  } = req.body;
  
  // Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Find education entry
  const educationIndex = student.education.findIndex(
    edu => edu._id.toString() === educationId
  );
  
  if (educationIndex === -1) {
    throw createError('Education history not found', 404);
  }
  
  // Update education entry
  student.education[educationIndex] = {
    ...student.education[educationIndex].toObject(),
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    isCurrentlyStudying,
    gpa,
    description
  };
  
  await student.save();
  
  res.status(200).json({
    success: true,
    message: 'Education history updated successfully',
    education: student.education[educationIndex]
  });
});

/**
 * Delete education history
 * @route DELETE /api/students/education/:id
 * @access Private (Student only)
 */
exports.deleteEducation = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const educationId = req.params.id;
  
  // Find and update student (pull education entry)
  const student = await Student.findByIdAndUpdate(
    studentId,
    {
      $pull: { education: { _id: educationId } }
    },
    { new: true }
  );
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Education history deleted successfully'
  });
});

/**
 * Get available scholarships
 * @route GET /api/students/scholarships
 * @access Private (Student only)
 */
exports.getAvailableScholarships = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  // Get student to check profile completion and existing applications
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Find active scholarships
  const scholarships = await Scholarship.findActiveScholarships()
    .skip(skip)
    .limit(limit);
  
  // Count total scholarships
  const total = await Scholarship.countDocuments({
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  });
  
  // Add a flag to indicate if student has already applied
  const scholarshipsWithAppliedFlag = scholarships.map(scholarship => {
    const hasApplied = student.scholarshipApplications.some(
      app => app.scholarshipId.toString() === scholarship._id.toString()
    );
    
    return {
      ...scholarship.toObject(),
      hasApplied
    };
  });
  
  res.status(200).json({
    success: true,
    count: scholarships.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    scholarships: scholarshipsWithAppliedFlag
  });
});

/**
 * Get scholarship details
 * @route GET /api/students/scholarships/:id
 * @access Private (Student only)
 */
exports.getScholarshipDetails = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const scholarshipId = req.params.id;
  
  // Get student to check if already applied
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Find scholarship
  const scholarship = await Scholarship.findById(scholarshipId);
  
  if (!scholarship) {
    throw createError('Scholarship not found', 404);
  }
  
  // Check if student has already applied
  const application = student.scholarshipApplications.find(
    app => app.scholarshipId.toString() === scholarshipId
  );
  
  // Check eligibility
  const eligibility = student.canApplyForScholarship(scholarship);
  
  res.status(200).json({
    success: true,
    scholarship,
    application: application || null,
    eligibility
  });
});

/**
 * Apply for scholarship
 * @route POST /api/students/scholarships/:id/apply
 * @access Private (Student only)
 */
exports.applyForScholarship = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const scholarshipId = req.params.id;
  
  // Get essays from request body
  const { essays } = req.body;
  
  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find student
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      throw createError('Student profile not found', 404);
    }
    
    // Find scholarship
    const scholarship = await Scholarship.findById(scholarshipId).session(session);
    
    if (!scholarship) {
      throw createError('Scholarship not found', 404);
    }
    
    // Check if scholarship is active and not expired
    if (!scholarship.isActive()) {
      throw createError('Scholarship is not active or has expired', 400);
    }
    
    // Check if student has already applied
    const hasApplied = student.scholarshipApplications.some(
      app => app.scholarshipId.toString() === scholarshipId
    );
    
    if (hasApplied) {
      throw createError('You have already applied for this scholarship', 400);
    }
    
    // Check eligibility
    const eligibility = student.canApplyForScholarship(scholarship);
    
    if (!eligibility.canApply) {
      throw createError(`You are not eligible for this scholarship: ${eligibility.reason}`, 400);
    }
    
    // Create application
    const application = {
      scholarshipId,
      status: 'pending',
      appliedAt: new Date(),
      essays: essays || []
    };
    
    // Add application to student
    student.scholarshipApplications.push(application);
    
    // Update scholarship application count
    scholarship.applicantCount += 1;
    
    // Save changes
    await student.save({ session });
    await scholarship.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: student.scholarshipApplications[student.scholarshipApplications.length - 1]
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
 * Get student applications
 * @route GET /api/students/applications
 * @access Private (Student only)
 */
exports.getApplications = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  // Get filter status from query
  const { status } = req.query;
  
  // Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Get applications based on status filter
  let applications = student.scholarshipApplications;
  
  if (status) {
    applications = applications.filter(app => app.status === status);
  }
  
  // Sort by applied date descending
  applications.sort((a, b) => b.appliedAt - a.appliedAt);
  
  // Populate scholarship details
  const populatedApplications = await Promise.all(
    applications.map(async (app) => {
      const scholarship = await Scholarship.findById(app.scholarshipId);
      
      return {
        ...app.toObject(),
        scholarship: scholarship ? {
          _id: scholarship._id,
          title: scholarship.title,
          amount: scholarship.amount,
          deadlineDate: scholarship.deadlineDate
        } : null
      };
    })
  );
  
  res.status(200).json({
    success: true,
    count: populatedApplications.length,
    applications: populatedApplications
  });
});

/**
 * Get application details
 * @route GET /api/students/applications/:id
 * @access Private (Student only)
 */
exports.getApplicationDetails = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const applicationId = req.params.id;
  
  // Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Find application
  const application = student.scholarshipApplications.find(
    app => app._id.toString() === applicationId
  );
  
  if (!application) {
    throw createError('Application not found', 404);
  }
  
  // Get scholarship details
  const scholarship = await Scholarship.findById(application.scholarshipId);
  
  // Get donor details if funded
  let donor = null;
  
  if (application.fundedBy) {
    donor = await mongoose.model('Donor').findById(application.fundedBy)
      .select('firstName lastName organizationName donorType');
  }
  
  // Get admin details if reviewed
  let admin = null;
  
  if (application.reviewedBy) {
    admin = await mongoose.model('Admin').findById(application.reviewedBy)
      .select('firstName lastName');
  }
  
  res.status(200).json({
    success: true,
    application: {
      ...application.toObject(),
      scholarship: scholarship ? {
        _id: scholarship._id,
        title: scholarship.title,
        amount: scholarship.amount,
        description: scholarship.description,
        deadlineDate: scholarship.deadlineDate
      } : null,
      donor: donor,
      admin: admin
    }
  });
});

/**
 * Get student dashboard data
 * @route GET /api/students/dashboard
 * @access Private (Student only)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  // Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw createError('Student profile not found', 404);
  }
  
  // Application statistics
  const applicationStats = {
    total: student.scholarshipApplications.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    funded: 0
  };
  
  // Calculate application statistics
  student.scholarshipApplications.forEach(app => {
    applicationStats[app.status] += 1;
  });
  
  // Get recent applications
  const recentApplications = await Promise.all(
    student.scholarshipApplications
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .slice(0, 5)
      .map(async (app) => {
        const scholarship = await Scholarship.findById(app.scholarshipId);
        
        return {
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          scholarship: scholarship ? {
            _id: scholarship._id,
            title: scholarship.title,
            amount: scholarship.amount
          } : null
        };
      })
  );
  
  // Get active scholarships count
  const activeScholarshipsCount = await Scholarship.countDocuments({
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  });
  
  // Get profile completion percentage
  let profileCompletion = 0;
  
  if (student.dateOfBirth) profileCompletion += 10;
  if (student.gender) profileCompletion += 10;
  if (student.institution) profileCompletion += 10;
  if (student.program) profileCompletion += 10;
  if (student.financialInfo && student.financialInfo.familyIncome) profileCompletion += 20;
  if (student.education && student.education.length > 0) profileCompletion += 20;
  if (student.address && student.address.city) profileCompletion += 10;
  if (student.bio) profileCompletion += 10;
  
  res.status(200).json({
    success: true,
    applicationStats,
    recentApplications,
    activeScholarshipsCount,
    profileCompletion,
    profileCompleted: student.profileCompleted
  });
});