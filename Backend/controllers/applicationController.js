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
  const searchTerm = req.query.search || '';
  
  // Build search filter if search term provided
  const searchFilter = searchTerm ? {
    $or: [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  } : {};
  
  // Combine filters
  const matchFilter = { ...statusFilter, ...searchFilter };

  // Use aggregation to get applications with student and scholarship details
  const applications = await Student.aggregate([
    { $match: searchFilter },
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
    { $unwind: { path: '$scholarship', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        studentId: '$_id',
        studentName: { $concat: ['$firstName', ' ', '$lastName'] },
        studentEmail: '$email',
        university: '$institution',
        major: '$program',
        gpa: '$currentGPA',
        expectedGraduation: '$expectedGraduationYear',
        applicationId: '$scholarshipApplications._id',
        scholarshipId: '$scholarshipApplications.scholarshipId',
        scholarshipName: '$scholarship.title',
        amount: '$scholarship.amount',
        status: '$scholarshipApplications.status',
        submittedDate: '$scholarshipApplications.appliedAt',
        reviewedAt: '$scholarshipApplications.reviewedAt',
        reviewedBy: '$scholarshipApplications.reviewedBy',
        fundedAt: '$scholarshipApplications.fundedAt',
        fundedBy: '$scholarshipApplications.fundedBy'
      }
    },
    { $sort: { submittedDate: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  // Get total count for pagination
  const totalCount = await Student.aggregate([
    { $match: searchFilter },
    { $unwind: '$scholarshipApplications' },
    { $match: statusFilter },
    { $count: 'total' }
  ]);

  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  
  // Map to frontend friendly format
  const formattedApplications = applications.map(app => ({
    _id: app.applicationId,
    studentId: app.studentId,
    studentName: app.studentName,
    scholarshipId: app.scholarshipId,
    scholarshipName: app.scholarshipName,
    amount: app.amount,
    status: app.status,
    submittedDate: app.submittedDate,
    university: app.university,
    major: app.major,
    gpa: app.gpa
  }));

  res.status(200).json({
    success: true,
    applications: formattedApplications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get application details
 * @route GET /api/applications/:id
 * @access Private (Admin only)
 */
exports.getApplicationDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if ID is valid
  let objectId;
  try {
    // If id is '0' or not a valid ObjectId, handle gracefully
    if (id === '0' || id === '' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    objectId = new mongoose.Types.ObjectId(id);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID format'
    });
  }
  
  try {
    // Use aggregation to find the application by ID
    const applicationResults = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications._id': objectId } },
      {
        $lookup: {
          from: 'scholarships',
          localField: 'scholarshipApplications.scholarshipId',
          foreignField: '_id',
          as: 'scholarship'
        }
      },
      { $unwind: { path: '$scholarship', preserveNullAndEmptyArrays: true } }
    ]);
    
    if (!applicationResults || applicationResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
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
      _id: applicationData.scholarshipApplications._id,
      applicationId: applicationData.scholarshipApplications._id,
      status: applicationData.scholarshipApplications.status,
      appliedAt: applicationData.scholarshipApplications.appliedAt,
      submittedDate: applicationData.scholarshipApplications.appliedAt,
      reviewedAt: applicationData.scholarshipApplications.reviewedAt,
      reviewedBy: applicationData.scholarshipApplications.reviewedBy,
      reviewer,
      fundedAt: applicationData.scholarshipApplications.fundedAt,
      fundedBy: applicationData.scholarshipApplications.fundedBy,
      funder,
      comments: applicationData.scholarshipApplications.comments,
      essays: applicationData.scholarshipApplications.essays,
      documents: applicationData.scholarshipApplications.documents,
      studentName: `${applicationData.firstName} ${applicationData.lastName}`,
      studentEmail: applicationData.email,
      university: applicationData.institution,
      major: applicationData.program,
      gpa: applicationData.currentGPA,
      expectedGraduation: applicationData.expectedGraduationYear,
      scholarshipName: applicationData.scholarship ? applicationData.scholarship.title : null,
      amount: applicationData.scholarship ? applicationData.scholarship.amount : null,
      essay: applicationData.scholarshipApplications.essays && applicationData.scholarshipApplications.essays.length > 0 
        ? applicationData.scholarshipApplications.essays[0].content 
        : null,
      additionalDocuments: applicationData.scholarshipApplications.documents || []
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
    
    const scholarship = applicationData.scholarship ? {
      _id: applicationData.scholarship._id,
      title: applicationData.scholarship.title,
      description: applicationData.scholarship.description,
      amount: applicationData.scholarship.amount,
      deadlineDate: applicationData.scholarship.deadlineDate,
      criteria: applicationData.scholarship.criteria
    } : null;
    
    res.status(200).json({
      success: true,
      application,
      student,
      scholarship
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving application details'
    });
  }
});

/**
 * Review application (approve or reject)
 * @route PUT /api/applications/:id/review
 * @access Private (Admin only)
 */
exports.reviewApplication = asyncHandler(async (req, res) => {
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
      message: 'Invalid application ID'
    });
  }
  
  // Function to process without transactions (fallback)
  const processWithoutTransaction = async () => {
    console.log('Processing application review without transaction');
    // Find the student with the application
    const result = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications._id': new mongoose.Types.ObjectId(id) } }
    ]);
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const { _id: studentId, scholarshipApplications } = result[0];
    const { scholarshipId } = scholarshipApplications;
    
    // Find student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find application in student's applications
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app._id.toString() === id
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found in student record'
      });
    }
    
    // Update application
    student.scholarshipApplications[applicationIndex].status = status;
    if (req.user && req.user._id) {
      student.scholarshipApplications[applicationIndex].reviewedBy = req.user._id;
    }
    student.scholarshipApplications[applicationIndex].reviewedAt = new Date();
    
    // Store reason if rejected
    if (status === 'rejected' && reason) {
      student.scholarshipApplications[applicationIndex].rejectionReason = reason;
    }
    
    await student.save();
    
    // IMPORTANT: Also update the application in the Application collection
    // This ensures the MongoDB trigger will fire
    const Application = mongoose.model('Application');
    const application = await Application.findOneAndUpdate(
      { studentId, scholarshipId },
      { 
        $set: { 
          status: status, 
          reviewedBy: req.user?._id,
          reviewedAt: new Date(),
          ...(status === 'rejected' && reason ? { rejectionReason: reason } : {})
        },
        $push: {
          statusHistory: {
            status: status,
            date: new Date(),
            updatedBy: req.user?._id,
            note: status === 'rejected' ? reason : `Application ${status} by admin`
          }
        }
      },
      { new: true }
    );
    
    // If application not found, try to create it
    if (!application) {
      console.log(`Application not found with studentId: ${studentId} and scholarshipId: ${scholarshipId}, trying alternate queries...`);
      
      // Try finding by only studentId
      const appByStudent = await Application.findOne({ studentId });
      if (appByStudent) {
        console.log(`Found application by studentId: ${appByStudent._id}`);
        await Application.updateOne(
          { _id: appByStudent._id },
          { 
            $set: { 
              status: status, 
              reviewedBy: req.user?._id,
              reviewedAt: new Date(),
              ...(status === 'rejected' && reason ? { rejectionReason: reason } : {})
            },
            $push: {
              statusHistory: {
                status: status,
                date: new Date(),
                updatedBy: req.user?._id,
                note: status === 'rejected' ? reason : `Application ${status} by admin`
              }
            }
          }
        );
        console.log(`Updated application by studentId: ${appByStudent._id}`);
      } else {
        // Create a new application
        try {
          const newApp = new Application({
            studentId,
            scholarshipId,
            status,
            reviewedBy: req.user?._id,
            reviewedAt: new Date(),
            appliedDate: new Date(),
            ...(status === 'rejected' && reason ? { rejectionReason: reason } : {}),
            statusHistory: [{
              status,
              date: new Date(),
              updatedBy: req.user?._id,
              note: status === 'rejected' ? reason : `Application ${status} by admin`
            }]
          });
          await newApp.save();
          console.log(`Created new application document: ${newApp._id}`);
        } catch (createErr) {
          console.error("Error creating application document:", createErr);
        }
      }
    }
    
    console.log(`Updated application in Application collection: ${application ? application._id : 'Not found'}`);
    
    // Update scholarship counts if applicable
    if (scholarshipId && mongoose.Types.ObjectId.isValid(scholarshipId)) {
      const scholarship = await Scholarship.findById(scholarshipId);
      
      if (scholarship) {
        if (status === 'approved') {
          scholarship.approvedCount = (scholarship.approvedCount || 0) + 1;
          await scholarship.save();
        }
      }
    }
    
    // Log admin activity if possible
    if (req.user && req.user.role === 'admin' && req.user._id) {
      try {
        const admin = await Admin.findById(req.user._id);
        
        if (admin && typeof admin.logActivity === 'function') {
          await admin.logActivity('review_application', {
            applicationId: id,
            scholarshipId,
            studentId,
            status,
            reason
          }, req);
        }
      } catch (logError) {
        console.error('Error logging admin activity:', logError);
        // Continue even if logging fails
      }
    }
    
    return {
      success: true,
      message: `Application ${status}`,
      application: student.scholarshipApplications[applicationIndex]
    };
  };
  
  // Function to process with transactions
  const processWithTransaction = async () => {
    console.log('Processing application review with transaction');
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find the student with the application first (outside transaction)
      const result = await Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications._id': new mongoose.Types.ObjectId(id) } }
      ]);
      
      if (result.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      const { _id: studentId, scholarshipApplications } = result[0];
      const { scholarshipId } = scholarshipApplications;
      
      // Find and update student within transaction
      const student = await Student.findById(studentId).session(session);
      
      if (!student) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Find application in student's applications
      const applicationIndex = student.scholarshipApplications.findIndex(
        app => app._id.toString() === id
      );
      
      if (applicationIndex === -1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Application not found in student record'
        });
      }
      
      // Update application
      student.scholarshipApplications[applicationIndex].status = status;
      if (req.user && req.user._id) {
        student.scholarshipApplications[applicationIndex].reviewedBy = req.user._id;
      }
      student.scholarshipApplications[applicationIndex].reviewedAt = new Date();
      
      // Store reason if rejected
      if (status === 'rejected' && reason) {
        student.scholarshipApplications[applicationIndex].rejectionReason = reason;
      }
      
      await student.save({ session });
      
      // IMPORTANT: Also update the application in the Application collection
      // This ensures the MongoDB trigger will fire
      const Application = mongoose.model('Application');
      const application = await Application.findOneAndUpdate(
        { studentId, scholarshipId },
        { 
          $set: { 
            status: status, 
            reviewedBy: req.user?._id,
            reviewedAt: new Date(),
            ...(status === 'rejected' && reason ? { rejectionReason: reason } : {})
          },
          $push: {
            statusHistory: {
              status: status,
              date: new Date(),
              updatedBy: req.user?._id,
              note: status === 'rejected' ? reason : `Application ${status} by admin`
            }
          }
        },
        { new: true, session }
      );
      
      // If application not found, try to create it
      if (!application) {
        console.log(`Application not found with studentId: ${studentId} and scholarshipId: ${scholarshipId}, trying alternate queries...`);
        
        // Try finding by only studentId
        const appByStudent = await Application.findOne({ studentId }).session(session);
        if (appByStudent) {
          console.log(`Found application by studentId: ${appByStudent._id}`);
          await Application.updateOne(
            { _id: appByStudent._id },
            { 
              $set: { 
                status: status, 
                reviewedBy: req.user?._id,
                reviewedAt: new Date(),
                ...(status === 'rejected' && reason ? { rejectionReason: reason } : {})
              },
              $push: {
                statusHistory: {
                  status: status,
                  date: new Date(),
                  updatedBy: req.user?._id,
                  note: status === 'rejected' ? reason : `Application ${status} by admin`
                }
              }
            },
            { session }
          );
          console.log(`Updated application by studentId: ${appByStudent._id}`);
        } else {
          // Create a new application
          try {
            const newApp = new Application({
              studentId,
              scholarshipId,
              status,
              reviewedBy: req.user?._id,
              reviewedAt: new Date(),
              appliedDate: new Date(),
              ...(status === 'rejected' && reason ? { rejectionReason: reason } : {}),
              statusHistory: [{
                status,
                date: new Date(),
                updatedBy: req.user?._id,
                note: status === 'rejected' ? reason : `Application ${status} by admin`
              }],
              statusHistory: [{
                status,
                date: new Date(),
                updatedBy: req.user?._id,
                note: status === 'rejected' ? reason : `Application ${status} by admin`
              }]
            });
            await newApp.save({ session });
            console.log(`Created new application document: ${newApp._id}`);
          } catch (createErr) {
            console.error("Error creating application document:", createErr);
          }
        }
      }
      
      console.log(`Updated application in Application collection: ${application ? application._id : 'Not found'}`);
      
      // Update scholarship counts if scholarshipId is valid
      if (scholarshipId && mongoose.Types.ObjectId.isValid(scholarshipId)) {
        const scholarship = await Scholarship.findById(scholarshipId).session(session);
        
        if (scholarship) {
          if (status === 'approved') {
            scholarship.approvedCount = (scholarship.approvedCount || 0) + 1;
            await scholarship.save({ session });
          }
        }
      }
      
      // Log admin activity if possible
      if (req.user && req.user.role === 'admin' && req.user._id) {
        const admin = await Admin.findById(req.user._id).session(session);
        
        if (admin && typeof admin.logActivity === 'function') {
          await admin.logActivity('review_application', {
            applicationId: id,
            scholarshipId,
            studentId,
            status,
            reason
          }, req);
        }
      }
      
      // All operations completed successfully, commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      return {
        success: true,
        message: `Application ${status}`,
        application: student.scholarshipApplications[applicationIndex]
      };
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  };
  
  try {
    let result;
    
    try {
      // First try with transactions
      result = await processWithTransaction();
    } catch (transactionError) {
      // Check if error is related to transactions not being supported
      const errorMsg = transactionError.message || '';
      const isTransactionSupportError = 
        errorMsg.includes('Transaction') || 
        errorMsg.includes('transaction') || 
        errorMsg.includes('replica set') ||
        /mongos|replicaset/i.test(errorMsg);
      
      console.log('Transaction error:', transactionError.message);
      
      if (isTransactionSupportError) {
        console.log('Falling back to non-transaction method');
        // Use non-transaction approach as fallback
        result = await processWithoutTransaction();
      } else {
        // For other errors, rethrow
        throw transactionError;
      }
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error processing application review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating application'
    });
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