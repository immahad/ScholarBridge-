const mongoose = require('mongoose');
const Student = require('../../models/Student');
const Scholarship = require('../../models/Scholarship');
const Admin = require('../../models/Admin');

/**
 * Submit a scholarship application in a single atomic transaction
 * 
 * @param {String} studentId - Student ID
 * @param {String} scholarshipId - Scholarship ID
 * @param {Object} applicationData - Application data (essays, documents, etc.)
 * @returns {Object} - Created application with related updates
 */
exports.submitScholarshipApplication = async (studentId, scholarshipId, applicationData) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Find the student
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // 2. Find the scholarship
    const scholarship = await Scholarship.findById(scholarshipId).session(session);
    
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }
    
    // 3. Check if scholarship is active and not expired
    if (scholarship.status !== 'active' || scholarship.deadlineDate < new Date()) {
      throw new Error('Scholarship is not active or has expired');
    }
    
    // 4. Check if student has already applied
    const hasApplied = student.scholarshipApplications.some(
      app => app.scholarshipId.toString() === scholarshipId.toString()
    );
    
    if (hasApplied) {
      throw new Error('Student has already applied for this scholarship');
    }
    
    // 5. Check if student profile is complete
    if (!student.profileCompleted) {
      throw new Error('Student profile must be completed before applying');
    }
    
    // 6. Create the application
    const application = {
      scholarshipId,
      status: 'pending',
      appliedAt: new Date(),
      essays: applicationData.essays || [],
      documents: applicationData.documents || []
    };
    
    // 7. Add application to student
    student.scholarshipApplications.push(application);
    
    await student.save({ session });
    
    // 8. Update scholarship application count
    scholarship.applicantCount += 1;
    
    await scholarship.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Return the application with scholarship info
    return {
      application: student.scholarshipApplications[student.scholarshipApplications.length - 1],
      scholarship: {
        _id: scholarship._id,
        title: scholarship.title,
        amount: scholarship.amount,
        deadlineDate: scholarship.deadlineDate
      }
    };
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

/**
 * Review a scholarship application in a single atomic transaction
 * 
 * @param {String} studentId - Student ID
 * @param {String} applicationId - Application ID
 * @param {String} adminId - Admin ID who is reviewing
 * @param {String} status - New status (approved/rejected)
 * @param {String} comments - Admin comments
 * @returns {Object} - Updated application with related updates
 */
exports.reviewScholarshipApplication = async (studentId, applicationId, adminId, status, comments) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Find the student
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // 2. Find the application
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app._id.toString() === applicationId
    );
    
    if (applicationIndex === -1) {
      throw new Error('Application not found');
    }
    
    const application = student.scholarshipApplications[applicationIndex];
    
    // 3. Check if application is in pending status
    if (application.status !== 'pending') {
      throw new Error('Only pending applications can be reviewed');
    }
    
    // 4. Update application status
    application.status = status;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    application.comments = comments;
    
    // 5. Save the student
    await student.save({ session });
    
    // 6. Find the scholarship
    const scholarship = await Scholarship.findById(application.scholarshipId).session(session);
    
    if (scholarship) {
      // 7. Update scholarship approved count if status is approved
      if (status === 'approved') {
        scholarship.approvedCount = (scholarship.approvedCount || 0) + 1;
        await scholarship.save({ session });
      }
    }
    
    // 8. Log admin activity
    const admin = await Admin.findById(adminId).session(session);
    
    if (admin) {
      await admin.logActivity('review_application', {
        studentId,
        scholarshipId: application.scholarshipId,
        applicationId,
        status,
        timestamp: new Date()
      }, null, session);
    }
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Return the updated application with scholarship info
    return {
      application: student.scholarshipApplications[applicationIndex],
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        institution: student.institution,
        program: student.program
      },
      scholarship: scholarship ? {
        _id: scholarship._id,
        title: scholarship.title,
        amount: scholarship.amount
      } : null
    };
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

/**
 * Withdraw a scholarship application in a single atomic transaction
 * 
 * @param {String} studentId - Student ID
 * @param {String} applicationId - Application ID
 * @param {String} reason - Withdrawal reason
 * @returns {Object} - Result of the operation
 */
exports.withdrawScholarshipApplication = async (studentId, applicationId, reason) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Find the student
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // 2. Find the application
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app._id.toString() === applicationId
    );
    
    if (applicationIndex === -1) {
      throw new Error('Application not found');
    }
    
    const application = student.scholarshipApplications[applicationIndex];
    
    // 3. Check if application can be withdrawn (only pending or approved can be withdrawn)
    if (!['pending', 'approved'].includes(application.status)) {
      throw new Error(`Application with status ${application.status} cannot be withdrawn`);
    }
    
    // Store scholarshipId for later
    const { scholarshipId } = application;
    
    // 4. Remove the application
    student.scholarshipApplications.splice(applicationIndex, 1);
    
    // 5. Save the student
    await student.save({ session });
    
    // 6. Update scholarship counts
    const scholarship = await Scholarship.findById(scholarshipId).session(session);
    
    if (scholarship) {
      // Decrement appropriate count
      if (application.status === 'pending') {
        if (scholarship.applicantCount > 0) {
          scholarship.applicantCount -= 1;
        }
      } else if (application.status === 'approved') {
        if (scholarship.approvedCount > 0) {
          scholarship.approvedCount -= 1;
        }
      }
      
      await scholarship.save({ session });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Return success result
    return {
      success: true,
      message: 'Application withdrawn successfully',
      withdrawalDate: new Date(),
      reason
    };
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
}; 