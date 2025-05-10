const Payment = require('../models/Payment');
const Donor = require('../models/Donor');
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const { processScholarshipPayment, refundScholarshipPayment, updatePaymentStatus } = require('../database/transactions/paymentTransactions');

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
          id: 'paypal',
          name: 'PayPal',
          description: 'Pay using your PayPal account',
          processingFee: '2.9% + $0.30',
          enabled: true
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer (ACH)',
          description: 'Direct transfer from your bank account (US only)',
          processingFee: '$0.25 per transaction',
          enabled: true
        }
      ],
      currencies: ['USD'],
      defaultCurrency: 'USD',
      minAmount: 5.00,
      maxAmount: 50000.00
    };
    
    return res.status(200).json({
      success: true,
      paymentOptions
    });
  } catch (error) {
    console.error('Get payment options error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment options',
      error: error.message
    });
  }
};

/**
 * Make a donation to a scholarship
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.makeDonation = async (req, res) => {
  try {
    const donorId = req.user.userId;
    const { 
      scholarshipId, 
      studentId, 
      amount, 
      paymentMethod, 
      transactionId, 
      notes,
      isAnonymous = false 
    } = req.body;
    
    // Validate scholarship and student exist
    const [scholarship, student] = await Promise.all([
      Scholarship.findById(scholarshipId),
      Student.findById(studentId)
    ]);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if student has applied for this scholarship
    const hasApplied = student.scholarshipApplications.some(
      app => app.scholarshipId.toString() === scholarshipId && app.status === 'approved'
    );
    
    if (!hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'Student has not been approved for this scholarship'
      });
    }
    
    // Process payment using transaction
    const paymentData = {
      donorId,
      studentId,
      scholarshipId,
      amount,
      paymentMethod,
      transactionId,
      notes,
      isAnonymous
    };
    
    const result = await processScholarshipPayment(paymentData);
    
    return res.status(201).json({
      success: true,
      message: 'Donation processed successfully',
      payment: result.payment,
      student: result.student,
      scholarship: result.scholarship
    });
  } catch (error) {
    console.error('Make donation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process donation',
      error: error.message
    });
  }
};

/**
 * Get donor's payment history
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
    
    // Get donations with scholarship and student info
    const payments = await Payment.find({ donorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('scholarshipId', 'title amount')
      .populate('studentId', 'firstName lastName institution program');
    
    // Get total count
    const total = await Payment.countDocuments({ donorId });
    
    // Get summary info
    const summary = await Payment.aggregate([
      { $match: { donorId, status: 'completed' } },
      { 
        $group: {
          _id: null,
          totalDonated: { $sum: '$amount' },
          totalPayments: { $sum: 1 }
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      summary: summary.length > 0 ? {
        totalDonated: summary[0].totalDonated,
        totalPayments: summary[0].totalPayments
      } : {
        totalDonated: 0,
        totalPayments: 0
      },
      payments
    });
  } catch (error) {
    console.error('Get donation history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get donation history',
      error: error.message
    });
  }
};

/**
 * Get payment details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Find payment with related info
    const payment = await Payment.findById(id)
      .populate('scholarshipId', 'title amount deadlineDate')
      .populate('studentId', 'firstName lastName institution program')
      .populate('donorId', 'firstName lastName organizationName donorType');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user has permission to view
    const canView = 
      userRole === 'admin' || 
      (userRole === 'donor' && payment.donorId._id.toString() === userId) ||
      (userRole === 'student' && payment.studentId._id.toString() === userId);
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this payment'
      });
    }
    
    return res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message
    });
  }
};

/**
 * Get all payments (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPayments = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    
    // Date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Search
    if (req.query.search) {
      filter.$or = [
        { transactionId: { $regex: req.query.search, $options: 'i' } },
        { notes: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get payments with related info
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('scholarshipId', 'title amount')
      .populate('studentId', 'firstName lastName institution program')
      .populate('donorId', 'firstName lastName organizationName donorType');
    
    // Get total count
    const total = await Payment.countDocuments(filter);
    
    // Calculate total amount
    const totalAmount = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    return res.status(500).json({
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
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminId = req.user.userId;
    
    // Validate status
    if (!['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }
    
    // Check if payment exists
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update payment status using transaction
    const updatedPayment = await updatePaymentStatus(id, status, adminId, note);
    
    return res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

/**
 * Refund payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.userId;
    
    // Check if payment exists
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Validate payment status
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }
    
    // Process refund using transaction
    const refundedPayment = await refundScholarshipPayment(id, adminId, reason);
    
    return res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      payment: refundedPayment
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
      error: error.message
    });
  }
};

/**
 * Get payment statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentStats = async (req, res) => {
  try {
    // Get payment stats by status
    const statsByStatus = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          total: 1,
          _id: 0
        }
      }
    ]);
    
    // Get payment stats by payment method
    const statsByMethod = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          method: '$_id',
          count: 1,
          total: 1,
          _id: 0
        }
      }
    ]);
    
    // Get monthly payment trends
    const monthlyTrends = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) 
          }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          total: 1,
          _id: 0
        }
      }
    ]);
    
    // Get overall stats
    const overallStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalPayments: 1,
          totalAmount: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
          minAmount: 1,
          maxAmount: 1
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      stats: {
        overall: overallStats.length > 0 ? overallStats[0] : null,
        byStatus: statsByStatus,
        byMethod: statsByMethod,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
}; 