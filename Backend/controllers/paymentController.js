const Payment = require('../models/Payment');
const Donor = require('../models/Donor');
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const { processScholarshipPayment, refundScholarshipPayment, updatePaymentStatus } = require('../database/transactions/paymentTransactions');
const config = require('../config/env');
const stripe = require('stripe')(config.stripe.secretKey);
const emailService = require('../services/emailService');
const mongoose = require('mongoose');

/**
 * Get payment options (methods, fee info, etc.)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentOptions = async (req, res) => {
  try {
    // Return available payment methods and information
    const paymentOptions = {
      methods: [
        {
          id: 'credit_card',
          name: 'Credit Card',
          description: 'Pay using Visa, MasterCard, or American Express',
          processingFee: '2.9% + $0.30',
          enabled: true
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer (ACH)',
          description: 'Direct transfer from your bank account (US only)',
          processingFee: '0.8% (capped at $5)',
          enabled: config.features.achPayments || false
        }
      ],
      taxDeductible: true,
      minimumAmount: 10,
      supportedCurrencies: ['USD']
    };

    res.status(200).json({
      success: true,
      paymentOptions
    });
  } catch (error) {
    console.error('Get payment options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment options',
      error: error.message
    });
  }
};

/**
 * Create payment intent with Stripe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { scholarshipId, studentId, amount } = req.body;
    const donorId = req.user.userId;
    
    // Validate inputs
    if (!scholarshipId || !studentId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }
    
    // Fetch scholarship to verify it exists and is active
    const scholarship = await Scholarship.findById(scholarshipId);
    
    if (!scholarship || scholarship.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Scholarship not found or not active'
      });
    }
    
    // Fetch student to verify they exist
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Verify student has applied for this scholarship
    const hasApplied = student.scholarshipApplications.some(
      app => app.scholarshipId.toString() === scholarshipId && app.status === 'approved'
    );
    
    if (!hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'Student has not applied or been approved for this scholarship'
      });
    }
    
    // Calculate amount in cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      // Store metadata for the payment
      metadata: {
        scholarshipId,
        studentId,
        donorId,
        scholarshipTitle: scholarship.title,
        studentName: `${student.firstName} ${student.lastName}`
      },
      // Add automatic payment methods (optional)
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Return the client secret to the client
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

/**
 * Make a donation to fund a scholarship
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.makeDonation = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {
      scholarshipId,
      studentId,
      amount,
      paymentMethod,
      transactionId,
      isAnonymous,
      notes
    } = req.body;
    
    const donorId = req.user.userId;
    
    // Validate inputs
    if (!scholarshipId || !studentId || !amount || !paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for donation'
      });
    }
    
    // Use the payment transactions service to process the scholarship payment
    const result = await processScholarshipPayment({
      donorId,
      studentId,
      scholarshipId,
      amount,
      paymentMethod,
      transactionId,
      isAnonymous: isAnonymous || false,
      notes: notes || '',
      session
    });
    
    if (!result.success) {
      // Abort transaction if payment failed
      await session.abortTransaction();
      
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    // Send email notifications
    await sendDonationEmails(result.payment);
    
    res.status(200).json({
      success: true,
      message: 'Donation processed successfully',
      payment: result.payment
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    
    console.error('Make donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process donation',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get a donor's payment history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDonorPaymentHistory = async (req, res) => {
  try {
    const donorId = req.user.userId;
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get payments with scholarship and student details
    const payments = await Payment.find({ donorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('scholarshipId', 'title amount')
      .populate('studentId', 'firstName lastName institution');
    
    // Get total count
    const total = await Payment.countDocuments({ donorId });
    
    // Calculate total amount donated
    const totalAmount = await Payment.aggregate([
      { $match: { donorId: mongoose.Types.ObjectId(donorId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      payments
    });
  } catch (error) {
    console.error('Get donor payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

/**
 * Handle webhook events from Stripe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      // Add other event handlers as needed
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
};

/**
 * Handle successful payment from Stripe webhook
 * @param {Object} paymentIntent - Stripe payment intent object
 */
async function handleSuccessfulPayment(paymentIntent) {
  try {
    const { scholarshipId, studentId, donorId } = paymentIntent.metadata;
    
    // If payment was already recorded in our system via the client, we don't need to do anything
    const existingPayment = await Payment.findOne({ transactionId: paymentIntent.id });
    
    if (existingPayment) {
      console.log(`Payment ${paymentIntent.id} already recorded in system`);
      return;
    }
    
    // If payment wasn't recorded (e.g., if client disconnected after payment), record it now
    const session = await mongoose.startSession();
    session.startTransaction();
    
    await processScholarshipPayment({
      donorId,
      studentId,
      scholarshipId,
      amount: paymentIntent.amount / 100, // Convert from cents
      paymentMethod: 'credit_card',
      transactionId: paymentIntent.id,
      session
    });
    
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error('Handle successful payment error:', error);
  }
}

/**
 * Handle failed payment from Stripe webhook
 * @param {Object} paymentIntent - Stripe payment intent object
 */
async function handleFailedPayment(paymentIntent) {
  try {
    console.log(`Payment ${paymentIntent.id} failed`);
    // Record failed payment or update existing payment record
  } catch (error) {
    console.error('Handle failed payment error:', error);
  }
}

/**
 * Handle refund from Stripe webhook
 * @param {Object} charge - Stripe charge object
 */
async function handleRefund(charge) {
  try {
    if (charge.refunded) {
      // Find the payment in our system
      const payment = await Payment.findOne({ transactionId: charge.payment_intent });
      
      if (payment) {
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        // Process refund
        await refundScholarshipPayment({
          paymentId: payment._id,
          refundAmount: charge.amount_refunded / 100, // Convert from cents
          refundReason: 'Refunded via Stripe',
          session
        });
        
        await session.commitTransaction();
        session.endSession();
      }
    }
  } catch (error) {
    console.error('Handle refund error:', error);
  }
}

/**
 * Send email notifications for a donation
 * @param {Object} payment - Payment object with populated references
 */
async function sendDonationEmails(payment) {
  try {
    // Fetch complete objects if they weren't populated
    let donor = payment.donorId;
    let student = payment.studentId;
    let scholarship = payment.scholarshipId;
    
    if (!donor.email) {
      donor = await Donor.findById(payment.donorId);
    }
    
    if (!student.email) {
      student = await Student.findById(payment.studentId);
    }
    
    if (!scholarship.title) {
      scholarship = await Scholarship.findById(payment.scholarshipId);
    }
    
    // Send confirmation email to donor
    await emailService.sendDonationConfirmationEmail(payment, donor, scholarship, student);
    
    // Send notification to student
    // Update the student's application status
    const studentApp = student.scholarshipApplications.find(
      app => app.scholarshipId.toString() === scholarship._id.toString()
    );
    
    if (studentApp) {
      studentApp.status = 'funded';
      await student.save();
      
      // Send application status email
      await emailService.sendApplicationStatusEmail(studentApp, student, scholarship);
    }
  } catch (error) {
    console.error('Send donation emails error:', error);
  }
}

/**
 * Check payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Check payment in our system
    const payment = await Payment.findOne({ transactionId });
    
    if (payment) {
      return res.status(200).json({
        success: true,
        status: payment.status,
        payment
      });
    }
    
    // If not found in our system, check with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    
    return res.status(200).json({
      success: true,
      status: paymentIntent.status,
      payment: null
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
};

/**
 * Get all payments with filtering options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPayments = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get payments with pagination
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName email institution')
      .populate('scholarshipId', 'title amount');
    
    // Get total count
    const total = await Payment.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

/**
 * Update payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePaymentStatus = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const result = await updatePaymentStatus({
      paymentId: id,
      status,
      notes,
      session
    });
    
    if (!result.success) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment: result.payment
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Process payment refund
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refundPayment = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    // Fetch the payment to get the Stripe transaction ID
    const payment = await Payment.findById(id);
    
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // If payment was made via Stripe, process the refund through Stripe
    if (payment.paymentMethod === 'credit_card' && payment.transactionId) {
      // Refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: Math.round(amount * 100), // Convert to cents for Stripe
        reason: 'requested_by_customer'
      });
      
      if (!refund) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Failed to process refund through payment processor'
        });
      }
    }
    
    // Process refund in our system
    const result = await refundScholarshipPayment({
      paymentId: id,
      refundAmount: amount,
      refundReason: reason || 'Refund requested by admin',
      session
    });
    
    if (!result.success) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      payment: result.payment
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get payment statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentStats = async (req, res) => {
  try {
    // Get date ranges for filtering
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    // Total payments
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    
    // Total amount
    const totalAmountResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
    
    // Today's payments
    const todayPayments = await Payment.countDocuments({
      status: 'completed',
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    
    // Today's amount
    const todayAmountResult = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayAmount = todayAmountResult.length > 0 ? todayAmountResult[0].total : 0;
    
    // Monthly payments
    const monthlyPayments = await Payment.countDocuments({
      status: 'completed',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Monthly amount
    const monthlyAmountResult = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyAmount = monthlyAmountResult.length > 0 ? monthlyAmountResult[0].total : 0;
    
    // Yearly payments
    const yearlyPayments = await Payment.countDocuments({
      status: 'completed',
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    });
    
    // Yearly amount
    const yearlyAmountResult = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const yearlyAmount = yearlyAmountResult.length > 0 ? yearlyAmountResult[0].total : 0;
    
    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format the monthly trend data
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: item._id.month,
      year: item._id.year,
      count: item.count,
      total: item.total
    }));
    
    res.status(200).json({
      success: true,
      stats: {
        total: {
          count: totalPayments,
          amount: totalAmount
        },
        today: {
          count: todayPayments,
          amount: todayAmount
        },
        monthly: {
          count: monthlyPayments,
          amount: monthlyAmount
        },
        yearly: {
          count: yearlyPayments,
          amount: yearlyAmount
        },
        monthlyTrend: formattedMonthlyTrend
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
}; 