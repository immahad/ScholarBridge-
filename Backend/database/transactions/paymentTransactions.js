// backend/database/transactions/paymentTransactions.js
const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Scholarship = require('../../models/Scholarship');
const Student = require('../../models/Student');
const Donor = require('../../models/Donor');
const Notification = require('../../models/Notification');

/**
 * Process a scholarship payment/donation in a single atomic transaction
 * 
 * @param {Object} paymentData - Payment data
 * @returns {Object} - Created payment with related updates
 */
exports.processScholarshipPayment = async (paymentData) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {
      donorId,
      studentId,
      scholarshipId,
      amount,
      paymentMethod,
      transactionId,
      notes,
      isAnonymous
    } = paymentData;
    
    // 1. Create the payment record
    const [payment] = await Payment.create([{
      donorId,
      studentId,
      scholarshipId,
      amount,
      paymentMethod,
      transactionId,
      status: 'completed',
      completedDate: new Date(),
      notes,
      isAnonymous,
      history: [{
        status: 'completed',
        date: new Date(),
        note: 'Payment created and completed'
      }]
    }], { session });
    
    // 2. Update student's scholarship application status
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Find the scholarship application
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app.scholarshipId.toString() === scholarshipId.toString()
    );
    
    if (applicationIndex === -1) {
      throw new Error('Scholarship application not found');
    }
    
    // Update application status to funded
    student.scholarshipApplications[applicationIndex].status = 'funded';
    student.scholarshipApplications[applicationIndex].fundedBy = donorId;
    student.scholarshipApplications[applicationIndex].fundedAt = new Date();
    
    await student.save({ session });
    
    // 3. Update donor's donation history
    const donor = await Donor.findById(donorId).session(session);
    
    if (!donor) {
      throw new Error('Donor not found');
    }
    
    // Add to donation history
    donor.donationHistory.push({
      scholarshipId,
      studentId,
      amount,
      paymentMethod,
      transactionId,
      status: 'completed',
      donationDate: new Date(),
      notes,
      isAnonymous
    });
    
    // Update total donated amount
    donor.totalDonated += amount;
    
    await donor.save({ session });
    
    // 4. Update scholarship funded count
    const scholarship = await Scholarship.findById(scholarshipId).session(session);
    
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }
    
    scholarship.fundedCount += 1;
    
    await scholarship.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Return the payment with donor and student info
    return {
      payment,
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        institution: student.institution,
        program: student.program
      },
      scholarship: {
        _id: scholarship._id,
        title: scholarship.title,
        amount: scholarship.amount
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
 * Refund a scholarship payment/donation in a single atomic transaction
 * 
 * @param {String} paymentId - Payment ID to refund
 * @param {String} adminId - Admin ID who authorized the refund
 * @param {String} refundReason - Reason for the refund
 * @returns {Object} - Updated payment with related updates
 */
exports.refundScholarshipPayment = async (paymentId, adminId, refundReason) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Find the payment
    const payment = await Payment.findById(paymentId).session(session);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }
    
    // Store the payment details for updates
    const { donorId, studentId, scholarshipId, amount } = payment;
    
    // 2. Update payment status
    payment.status = 'refunded';
    payment._updatedBy = adminId;
    payment.history.push({
      status: 'refunded',
      date: new Date(),
      updatedBy: adminId,
      note: refundReason
    });
    
    await payment.save({ session });
    
    // 3. Update student's scholarship application status
    const student = await Student.findById(studentId).session(session);
    
    if (student) {
      // Find the scholarship application
      const applicationIndex = student.scholarshipApplications.findIndex(
        app => app.scholarshipId.toString() === scholarshipId.toString()
      );
      
      if (applicationIndex !== -1) {
        // Revert application status to approved
        student.scholarshipApplications[applicationIndex].status = 'approved';
        student.scholarshipApplications[applicationIndex].fundedBy = undefined;
        student.scholarshipApplications[applicationIndex].fundedAt = undefined;
        
        await student.save({ session });
      }
    }
    
    // 4. Update donor's donation record and total
    const donor = await Donor.findById(donorId).session(session);
    
    if (donor) {
      // Find the donation in history
      const donationIndex = donor.donationHistory.findIndex(
        donation => donation.transactionId === payment.transactionId
      );
      
      if (donationIndex !== -1) {
        // Update donation status
        donor.donationHistory[donationIndex].status = 'refunded';
        
        // Reduce total donated amount
        donor.totalDonated -= amount;
        
        await donor.save({ session });
      }
    }
    
    // 5. Update scholarship funded count
    const scholarship = await Scholarship.findById(scholarshipId).session(session);
    
    if (scholarship && scholarship.fundedCount > 0) {
      scholarship.fundedCount -= 1;
      
      await scholarship.save({ session });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Return the updated payment
    return payment;
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
 * Update payment status with transaction
 * @param {string} paymentId - Payment ID
 * @param {string} status - New status
 * @param {string} updatedBy - User ID who updated the payment
 * @param {string} note - Optional note
 * @returns {Promise<Object>} - Updated payment
 */
async function updatePaymentStatus(paymentId, status, updatedBy, note = '') {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Get the payment
    const payment = await Payment.findById(paymentId).session(session);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // 2. Update payment status
    payment.status = status;
    payment._updatedBy = updatedBy;
    
    // 3. Add to history
    payment.history.push({
      status,
      updatedBy,
      note,
      date: new Date()
    });
    
    await payment.save({ session });
    
    // 4. Handle status-specific actions
    if (status === 'refunded') {
      // If refunded, update donor and scholarship
      await Donor.findByIdAndUpdate(
        payment.donorId,
        {
          $inc: {
            totalDonated: -payment.amount,
            donationCount: -1
          }
        },
        { session }
      );
      
      // Update scholarship status back to active
      await Scholarship.findByIdAndUpdate(
        payment.scholarshipId,
        {
          status: 'active',
          $unset: { awardedTo: "", awardedDate: "" }
        },
        { session }
      );
      
      // Update student scholarship application
      await Student.findOneAndUpdate(
        { 
          _id: payment.studentId,
          'scholarshipApplications.scholarshipId': payment.scholarshipId
        },
        {
          $set: {
            'scholarshipApplications.$.status': 'approved',
            $unset: { 'scholarshipApplications.$.paymentId': "" }
          }
        },
        { session }
      );
    }
    
    // 5. Create notifications
    const getRecipientId = async (type) => {
      if (type === 'student') {
        const student = await Student.findById(payment.studentId).select('userId').session(session);
        return student.userId;
      } else if (type === 'donor') {
        const donor = await Donor.findById(payment.donorId).select('userId').session(session);
        return donor.userId;
      }
      return null;
    };
    
    const studentUserId = await getRecipientId('student');
    const donorUserId = await getRecipientId('donor');
    
    // Create notifications based on status
    const notificationData = [];
    
    if (status === 'completed') {
      notificationData.push({
        recipient: studentUserId,
        title: 'Payment Verified',
        message: 'Your scholarship payment has been verified and completed.',
        type: 'success',
        relatedTo: {
          model: 'Payment',
          id: payment._id
        }
      });
    } else if (status === 'failed') {
      notificationData.push({
        recipient: donorUserId,
        title: 'Payment Failed',
        message: 'Your scholarship payment has failed. Please try again.',
        type: 'error',
        relatedTo: {
          model: 'Payment',
          id: payment._id
        }
      });
    } else if (status === 'refunded') {
      notificationData.push({
        recipient: donorUserId,
        title: 'Payment Refunded',
        message: 'Your scholarship payment has been refunded.',
        type: 'warning',
        relatedTo: {
          model: 'Payment',
          id: payment._id
        }
      });
      
      notificationData.push({
        recipient: studentUserId,
        title: 'Scholarship Funding Refunded',
        message: 'The funding for your scholarship has been refunded.',
        type: 'warning',
        relatedTo: {
          model: 'Payment',
          id: payment._id
        }
      });
    }
    
    if (notificationData.length > 0) {
      await Notification.create(notificationData, { session });
    }
    
    // 6. Commit the transaction
    await session.commitTransaction();
    return payment;
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
  processScholarshipPayment: exports.processScholarshipPayment,
  refundScholarshipPayment: exports.refundScholarshipPayment,
  updatePaymentStatus
};