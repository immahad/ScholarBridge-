const mongoose = require('mongoose');
const User = require('../../models/User');
const Student = require('../../models/Student');
const Donor = require('../../models/Donor');
const Admin = require('../../models/Admin');

/**
 * Transaction to create a user with profile data in a single atomic operation
 * 
 * @param {Object} userData - Base user data
 * @param {Object} profileData - Role-specific profile data
 * @returns {Object} - Created user
 */
const createUserWithProfile = async (userData, profileData = {}) => {
  console.log('Starting createUserWithProfile transaction...');
  console.log('User data:', JSON.stringify({ ...userData, password: '[REDACTED]' }, null, 2));
  console.log('Profile data:', JSON.stringify(profileData, null, 2));
  
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Extract user role
    const { role } = userData;
    
    // Select the appropriate model based on role
    let UserModel;
    
    switch (role) {
      case 'student':
        UserModel = Student;
        break;
      case 'donor':
        UserModel = Donor;
        break;
      case 'admin':
        UserModel = Admin;
        break;
      default:
        throw new Error(`Invalid user role: ${role}`);
    }
    
    // Create user with profile data
    const mergedData = { ...userData, ...profileData };
    console.log('Creating user with merged data:', JSON.stringify({ ...mergedData, password: '[REDACTED]' }, null, 2));
    
    // Create user within the transaction
    const [user] = await UserModel.create([mergedData], { session });
    console.log('User created successfully with ID:', user._id);
    
    // If user is an admin, create initial admin log
    if (role === 'admin') {
      await user.logActivity('profile_created', { 
        timestamp: new Date() 
      }, null, session);
    }
    
    // Commit the transaction
    await session.commitTransaction();
    
    return user;
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
 * Update user profile data in a transaction
 * 
 * @param {String} userId - User ID
 * @param {Object} userData - Base user data to update
 * @param {Object} profileData - Role-specific profile data to update
 * @returns {Object} - Updated user
 */
const updateUserWithProfile = async (userId, userData, profileData = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find user to get the role
    const user = await User.findById(userId).session(session);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Select appropriate model based on role
    let UserModel;
    
    switch (user.role) {
      case 'student':
        UserModel = Student;
        break;
      case 'donor':
        UserModel = Donor;
        break;
      case 'admin':
        UserModel = Admin;
        break;
      default:
        throw new Error(`Invalid user role: ${user.role}`);
    }
    
    // Merge data for update
    const mergedData = { ...userData, ...profileData, updatedAt: new Date() };
    
    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      mergedData,
      { new: true, session }
    );
    
    // If user is an admin, log activity
    if (user.role === 'admin') {
      await updatedUser.logActivity('profile_updated', { 
        updatedFields: Object.keys(mergedData),
        timestamp: new Date() 
      }, null, session);
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    return updatedUser;
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
 * Delete user account (or deactivate if it has related data)
 * 
 * @param {String} userId - User ID
 * @param {Boolean} hardDelete - Whether to perform a hard delete
 * @returns {Object} - Result of the operation
 */
exports.deleteUserAccount = async (userId, hardDelete = false) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find user to get the role
    const user = await User.findById(userId).session(session);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user has related data that would prevent deletion
    let hasRelatedData = false;
    
    if (user.role === 'student') {
      // Check if student has scholarship applications
      const student = await Student.findById(userId).session(session);
      hasRelatedData = student && student.scholarshipApplications && student.scholarshipApplications.length > 0;
    } else if (user.role === 'donor') {
      // Check if donor has donations
      const donor = await Donor.findById(userId).session(session);
      hasRelatedData = donor && donor.donationHistory && donor.donationHistory.length > 0;
    }
    
    let result;
    
    if (hasRelatedData && !hardDelete) {
      // Soft delete (deactivate) the user
      result = await User.findByIdAndUpdate(
        userId,
        { 
          isActive: false,
          tokenVersion: (user.tokenVersion || 0) + 1, // Invalidate tokens
          updatedAt: new Date()
        },
        { new: true, session }
      );
    } else {
      // Hard delete the user
      result = await User.findByIdAndDelete(userId).session(session);
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    return {
      success: true,
      message: hasRelatedData && !hardDelete ? 'User account deactivated' : 'User account deleted',
      wasDeactivated: hasRelatedData && !hardDelete,
      user: result
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

async function applyForScholarship(scholarshipId, studentId, studentUserId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Get the scholarship
      const scholarship = await Scholarship.findById(scholarshipId).session(session);
      
      if (!scholarship) {
        throw new Error('Scholarship not found');
      }
      
      // 2. Check if scholarship is available for applications
      if (scholarship.status !== 'active') {
        throw new Error('This scholarship is not accepting applications');
      }
      
      // 3. Check if student meets eligibility criteria
      const student = await Student.findById(studentId).session(session);
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      // 4. Check if student has already applied for this scholarship
      const existingApplication = student.scholarshipApplications.find(
        app => app.scholarshipId.toString() === scholarshipId
      );
      
      if (existingApplication) {
        throw new Error('You have already applied for this scholarship');
      }
      
      // 5. Add scholarship to student's applications
      const applicationData = {
        scholarshipId,
        status: 'pending',
        appliedDate: new Date()
      };
      
      student.scholarshipApplications.push(applicationData);
      await student.save({ session });
      
      // 6. Update scholarship application count
      scholarship.applicationsCount = (scholarship.applicationsCount || 0) + 1;
      await scholarship.save({ session });
      
      // 7. Create notification for scholarship admin
      const adminNotification = {
        recipient: scholarship.createdBy, // Assuming this is the admin's userId
        title: 'New Scholarship Application',
        message: `A new application has been submitted for ${scholarship.title}`,
        type: 'info',
        relatedTo: {
          model: 'Scholarship',
          id: scholarshipId
        }
      };
      
      await Notification.create([adminNotification], { session });
      
      // 8. Commit the transaction
      await session.commitTransaction();
      
      return {
        success: true,
        applicationData
      };
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }
  
  /**
   * Update a scholarship application status with MongoDB transaction
   * @param {string} scholarshipId - Scholarship ID
   * @param {string} studentId - Student ID
   * @param {string} status - New status (approved, rejected)
   * @param {string} updatedBy - Admin user ID
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} - Updated application
   */
  async function updateScholarshipApplication(scholarshipId, studentId, status, updatedBy, notes = '') {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Find the student and their application
      const student = await Student.findOne({ 
        _id: studentId,
        'scholarshipApplications.scholarshipId': scholarshipId
      }).session(session);
      
      if (!student) {
        throw new Error('Student or application not found');
      }
      
      // 2. Get the application index
      const applicationIndex = student.scholarshipApplications.findIndex(
        app => app.scholarshipId.toString() === scholarshipId
      );
      
      if (applicationIndex === -1) {
        throw new Error('Application not found');
      }
      
      // 3. Update the application status
      student.scholarshipApplications[applicationIndex].status = status;
      student.scholarshipApplications[applicationIndex].statusUpdateDate = new Date();
      student.scholarshipApplications[applicationIndex].notes = notes;
      student.scholarshipApplications[applicationIndex]._updatedBy = updatedBy;
      
      await student.save({ session });
      
      // 4. Update scholarship based on status
      const scholarship = await Scholarship.findById(scholarshipId).session(session);
      
      if (status === 'approved') {
        // If approved, mark scholarship as pending award
        scholarship.status = 'pending_award';
        scholarship.approvedApplicantId = studentId;
        await scholarship.save({ session });
      } else if (status === 'rejected') {
        // Nothing special needed for rejected applications
      }
      
      // 5. Create notification for student
      const studentUser = await Student.findById(studentId).select('userId').session(session);
      
      let notificationTitle, notificationMessage, notificationType;
      
      if (status === 'approved') {
        notificationTitle = 'Application Approved';
        notificationMessage = `Your application for ${scholarship.title} has been approved! A donor will be selected soon.`;
        notificationType = 'success';
      } else if (status === 'rejected') {
        notificationTitle = 'Application Status Update';
        notificationMessage = `Your application for ${scholarship.title} was not selected at this time.`;
        notificationType = 'info';
      }
      
      const notification = {
        recipient: studentUser.userId,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        relatedTo: {
          model: 'Scholarship',
          id: scholarshipId
        }
      };
      
      await Notification.create([notification], { session });
      
      // 6. Commit the transaction
      await session.commitTransaction();
      
      return {
        success: true,
        status,
        studentId,
        scholarshipId
      };
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }
  
  /**
   * Create a new scholarship with MongoDB transaction
   * @param {Object} scholarshipData - Scholarship data
   * @param {string} createdBy - User ID who created the scholarship
   * @returns {Promise<Object>} - Created scholarship
   */
  async function createScholarship(scholarshipData, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Create the scholarship
      const scholarship = await Scholarship.create([{
        ...scholarshipData,
        status: 'active',
        createdBy,
        createdAt: new Date(),
        applicationsCount: 0
      }], { session });
      
      const newScholarship = scholarship[0];
      
      // 2. Create notification for admin users to review
      // Assuming there's an Admin model or some way to get admin users
      // For now, we'll just create a notification for the creator
      const notification = {
        recipient: createdBy,
        title: 'New Scholarship Created',
        message: `Your new scholarship "${scholarshipData.title}" has been created and is now active.`,
        type: 'success',
        relatedTo: {
          model: 'Scholarship',
          id: newScholarship._id
        }
      };
      
      await Notification.create([notification], { session });
      
      // 3. Commit the transaction
      await session.commitTransaction();
      return newScholarship;
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }
  
  /**
   * Cancel a scholarship with MongoDB transaction
   * @param {string} scholarshipId - Scholarship ID
   * @param {string} updatedBy - User ID who canceled the scholarship
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} - Canceled scholarship
   */
  async function cancelScholarship(scholarshipId, updatedBy, reason = '') {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Get the scholarship
      const scholarship = await Scholarship.findById(scholarshipId).session(session);
      
      if (!scholarship) {
        throw new Error('Scholarship not found');
      }
      
      // 2. Check if scholarship can be canceled
      if (scholarship.status === 'awarded' || scholarship.status === 'completed') {
        throw new Error('Cannot cancel a scholarship that has been awarded or completed');
      }
      
      // 3. Update scholarship status
      scholarship.status = 'canceled';
      scholarship.cancelReason = reason;
      scholarship.canceledBy = updatedBy;
      scholarship.canceledAt = new Date();
      
      await scholarship.save({ session });
      
      // 4. Update any pending student applications
      await Student.updateMany(
        { 'scholarshipApplications.scholarshipId': scholarshipId, 'scholarshipApplications.status': 'pending' },
        { $set: { 'scholarshipApplications.$.status': 'canceled' } },
        { session }
      );
      
      // 5. Get all students who applied to this scholarship
      const students = await Student.find({
        'scholarshipApplications.scholarshipId': scholarshipId
      }).select('userId').session(session);
      
      // 6. Create notifications for students
      const notificationPromises = students.map(student => {
        return Notification.create([{
          recipient: student.userId,
          title: 'Scholarship Canceled',
          message: `The scholarship "${scholarship.title}" has been canceled. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'warning',
          relatedTo: {
            model: 'Scholarship',
            id: scholarshipId
          }
        }], { session });
      });
      
      await Promise.all(notificationPromises);
      
      // 7. Commit the transaction
      await session.commitTransaction();
      return scholarship;
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }
  
  module.exports = {
    createUserWithProfile,
    updateUserWithProfile,
    applyForScholarship,
    updateScholarshipApplication,
    createScholarship,
    cancelScholarship
  };