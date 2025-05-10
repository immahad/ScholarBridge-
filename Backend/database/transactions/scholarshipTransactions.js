// backend/database/transactions/scholarshipTransactions.js
const mongoose = require('mongoose');
const Scholarship = require('../../models/Scholarship');
const Student = require('../../models/Student');
const Notification = require('../../models/Notification');

/**
 * Process a scholarship application with MongoDB transaction
 * @param {string} scholarshipId - Scholarship ID
 * @param {string} studentId - Student ID
 * @param {string} studentUserId - Student User ID
 * @returns {Promise<Object>} - Application result
 */
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
    applyForScholarship,
    updateScholarshipApplication,
    createScholarship,
    cancelScholarship
  };