// backend/controllers/studentController.js
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const Admin = require('../models/Admin');
const Donor = require('../models/Donor');
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
  
  // Destructure all updatable fields from req.body
  const { 
    firstName, lastName, phoneNumber, // from User model, if you update them via student profile
    dateOfBirth, gender, institution, program, currentYear, 
    expectedGraduationYear, currentGPA, address, financialInfo, bio 
  } = req.body;

  // Prepare the update object for Student model fields
  const studentProfileUpdates = {
    dateOfBirth, gender, institution, program, currentYear,
    expectedGraduationYear, currentGPA, address, financialInfo, bio,
    profileCompleted: true, // Keep the boolean flag for basic completion
    updatedAt: Date.now()
  };

  // Filter out undefined fields to avoid overwriting with null if not provided in request
  Object.keys(studentProfileUpdates).forEach(key => studentProfileUpdates[key] === undefined && delete studentProfileUpdates[key]);
  if (financialInfo) {
    Object.keys(financialInfo).forEach(key => financialInfo[key] === undefined && delete financialInfo[key]);
  }
  if (address) {
    Object.keys(address).forEach(key => address[key] === undefined && delete address[key]);
  }

  // Find student to apply updates and then calculate completion
  let student = await Student.findById(studentId);
  if (!student) {
    throw createError('Student profile not found', 404);
  }

  // Apply User fields updates (firstName, lastName, phoneNumber) if they are part of the student profile update process
  // These fields are on the parent User model, so handle their update carefully.
  // For simplicity, assuming they are sent in req.body and we update them directly on the student instance if changed.
  // This part might need adjustment based on how User fields are managed (e.g., separate endpoint or specific logic here).
  if (firstName !== undefined && student.firstName !== firstName) student.firstName = firstName;
  if (lastName !== undefined && student.lastName !== lastName) student.lastName = lastName;
  if (phoneNumber !== undefined && student.phoneNumber !== phoneNumber) student.phoneNumber = phoneNumber;

  // Apply Student-specific fields
  Object.assign(student, studentProfileUpdates);

  // Recalculate and set the numeric profile completion percentage
  student.profileCompletionPercentage = calculateProfileCompletion(student); 

  // Save the updated student document
  await student.save({ runValidators: true });
  
  // Refetch to ensure all virtuals and populated paths are fresh, though save() should return the updated doc.
  student = await Student.findById(studentId);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    student // This student object now includes the updated profileCompletionPercentage
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
  
  // Find active scholarships (only active and visible ones)
  const scholarships = await Scholarship.find({
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  })
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
  const { academicInfo, statement, documents } = req.body;
  
  try {
    // Find student
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw createError('Student profile not found', 404);
    }
    
    // Find scholarship
    const scholarship = await Scholarship.findById(scholarshipId);
    
    if (!scholarship) {
      throw createError('Scholarship not found', 404);
    }
    
    // Check if scholarship is active and not expired
    if (scholarship.status !== 'active' || (scholarship.deadlineDate && new Date(scholarship.deadlineDate) < new Date())) {
      throw createError('Scholarship is not active or has expired', 400);
    }
    
    // Check if student has already applied
    const hasApplied = student.scholarshipApplications.some(
      app => app.scholarshipId.toString() === scholarshipId
    );
    
    if (hasApplied) {
      throw createError('You have already applied for this scholarship', 400);
    }
    
    // Create application
    const application = {
      scholarshipId,
      status: 'pending',
      appliedAt: new Date(),
      essays: [{
        question: 'Personal Statement',
        answer: statement
      }],
      documents: documents || []
    };
    
    // Add application to student
    student.scholarshipApplications.push(application);
    
    // Save student with new application
    await student.save();
    
    // Update scholarship application count separately
    await Scholarship.findByIdAndUpdate(
      scholarshipId,
      { $inc: { applicantCount: 1 } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: student.scholarshipApplications[student.scholarshipApplications.length - 1]
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to submit application'
    });
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
    donor = await Donor.findById(application.fundedBy)
      .select('firstName lastName organizationName donorType');
  }
  
  // Get admin details if reviewed
  let admin = null;
  
  if (application.reviewedBy) {
    admin = await Admin.findById(application.reviewedBy)
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

  const student = await Student.findById(studentId)
    .populate('scholarshipApplications.scholarshipId', 'title status amount deadlineDate');

  if (!student) {
    throw createError('Student profile not found', 404);
  }

  // Application stats
  const applicationStats = {
    total: student.scholarshipApplications.length,
    pending: student.scholarshipApplications.filter(app => app.status === 'pending').length,
    approved: student.scholarshipApplications.filter(app => app.status === 'approved').length,
    rejected: student.scholarshipApplications.filter(app => app.status === 'rejected').length,
    accepted: student.scholarshipApplications.filter(app => app.status === 'accepted').length,
    funded: student.scholarshipApplications.filter(app => app.status === 'funded').length,
  };

  // Recent applications
  let recentApplications = [];
  if (student.scholarshipApplications && Array.isArray(student.scholarshipApplications)) {
    recentApplications = student.scholarshipApplications
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)) // Sort by date
      .slice(0, 5)
      .map(app => {
        let scholarshipTitle = 'N/A - Details Missing';
        let scholarshipAmount = 0;

        if (app.scholarshipId && typeof app.scholarshipId === 'object') {
          // app.scholarshipId is populated
          scholarshipTitle = app.scholarshipId.title || 'N/A - Title Missing';
          scholarshipAmount = app.scholarshipId.amount || 0;
        } else if (app.scholarshipId) {
          // app.scholarshipId is likely just an ObjectId (populate failed or partial)
          scholarshipTitle = 'Scholarship details loading...';
        }

        return {
          _id: app._id,
          scholarshipTitle,
          scholarshipAmount,
          status: app.status,
          appliedAt: app.appliedAt,
        };
      });
  }
    
  const activeScholarshipsCount = await Scholarship.countDocuments({ 
    status: 'active', 
    deadlineDate: { $gt: new Date() } 
  });

  // Use the stored profileCompletionPercentage for the dashboard
  // The calculateProfileCompletion helper is primarily for updates now.
  res.status(200).json({
    success: true,
    data: {
      firstName: student.firstName,
      applicationStats,
      recentApplications,
      activeScholarshipsCount,
      profileCompletion: student.profileCompletionPercentage, // Use stored numeric percentage
      profileCompleted: student.profileCompleted, // Boolean flag
    }
  });
});

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (student) => {
  let score = 0;
  const fieldChecks = [
    { fields: ['firstName', 'lastName'], weight: 1 }, // Assuming lastName is also important for completion
    { fields: ['dateOfBirth'], weight: 1 },
    { fields: ['gender'], weight: 1 },
    { fields: ['cnic'], weight: 1 },
    { fields: ['phoneNumber'], weight: 1 }, // from User model, student inherits it
    { 
      group: 'address',
      fields: ['street', 'city', 'state', 'postalCode', 'country'], 
      weight: 1 
    },
    { 
      group: 'educationFields', // Represents core education details on student model
      fields: ['institution', 'program', 'currentYear', 'expectedGraduationYear'], 
      weight: 1 
    },
    { fields: ['currentGPA'], weight: 1, isNumericOrNull: true },
    { 
      group: 'financialInfo',
      fields: ['familyIncome', 'dependentFamilyMembers', 'fafsaCompleted', 'externalAidAmount'],
      weight: 2 // Example: Financial info might be weighted more, or less, or 1
    }
  ];

  const totalPossibleWeight = fieldChecks.reduce((sum, check) => sum + check.weight, 0);
  let achievedWeight = 0;

  fieldChecks.forEach(check => {
    let sectionComplete = true;
    if (check.group === 'address') {
      if (!student.address) sectionComplete = false;
      else {
        for (const field of check.fields) {
          if (!student.address[field]) {
            sectionComplete = false;
            break;
          }
        }
      }
    } else if (check.group === 'educationFields'){
      for (const field of check.fields) {
        if (!student[field]) {
          sectionComplete = false;
          break;
        }
      }
    } else if (check.group === 'financialInfo') {
      if (!student.financialInfo) sectionComplete = false;
      else {
        // For financial info, consider it complete if all specified sub-fields are filled.
        // Or adjust logic: e.g. at least N fields, or specific ones are mandatory.
        for (const field of check.fields) {
          if (student.financialInfo[field] === null || student.financialInfo[field] === undefined) {
            // For fafsaCompleted (boolean), undefined/null might mean not answered.
            // For numeric fields like externalAidAmount, 0 is a valid value, null/undefined means not answered.
            if (field === 'fafsaCompleted' && student.financialInfo[field] === undefined) sectionComplete = false;
            else if (field !== 'fafsaCompleted' && (student.financialInfo[field] === null || student.financialInfo[field] === undefined)) sectionComplete = false; 
            if (!sectionComplete) break;
          }
        }
      }
    } else { // Top-level fields
      for (const field of check.fields) {
        if (check.isNumericOrNull) { // for GPA, 0 is valid, null means not entered
          if (student[field] === undefined || student[field] === null) sectionComplete = false; 
        } else if (!student[field]) { // For strings, etc.
          sectionComplete = false;
        }
        if (!sectionComplete) break;
      }
    }
    if (sectionComplete) {
      achievedWeight += check.weight;
    }
  });

  if (totalPossibleWeight === 0) return 0; // Avoid division by zero
  const percentage = Math.round((achievedWeight / totalPossibleWeight) * 100);
  console.log(`Calculated profile completion: ${percentage}% (Achieved: ${achievedWeight}, Total: ${totalPossibleWeight}) for student ${student._id}`);
  return percentage;
};