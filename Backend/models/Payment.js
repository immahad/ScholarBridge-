// backend/models/Payment.js
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * Payment Schema
 * Used for tracking scholarship payments made by donors
 */
const paymentSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: [true, 'Donor ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: [true, 'Scholarship ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'crypto', 'other'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  receiptUrl: String,
  paymentDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  // For audit trail
  history: [
    {
      status: String,
      date: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      note: String
    }
  ]
}, {
  timestamps: true,
  toJSON: { getters: true } // Enable getters for decryption
});

// Create indexes for common queries
paymentSchema.index({ donorId: 1 });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ scholarshipId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ donorId: 1, status: 1 });
paymentSchema.index({ 'paymentDetails.cardLastFour': 1 });

// Pre-save hook to set completedDate when status changes to completed
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  if (this.isModified('status')) {
    this.history.push({
      status: this.status,
      date: new Date(),
      updatedBy: this._updatedBy,
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Create a payment with transaction support
paymentSchema.statics.createPaymentWithTransaction = async function(paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create payment
    const payment = await this.create([paymentData], { session });
    
    // Update student scholarship application
    const Student = mongoose.model('Student');
    const student = await Student.findById(paymentData.studentId).session(session);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app.scholarshipId.toString() === paymentData.scholarshipId.toString()
    );
    
    if (applicationIndex === -1) {
      throw new Error('Scholarship application not found');
    }
    
    // Update application status to funded
    student.scholarshipApplications[applicationIndex].status = 'funded';
    student.scholarshipApplications[applicationIndex].fundedBy = paymentData.donorId;
    student.scholarshipApplications[applicationIndex].fundedAt = new Date();
    
    await student.save({ session });
    
    // Update donor donation history
    const Donor = mongoose.model('Donor');
    const donor = await Donor.findById(paymentData.donorId).session(session);
    
    if (!donor) {
      throw new Error('Donor not found');
    }
    
    // Add to donation history
    donor.donationHistory.push({
      scholarshipId: paymentData.scholarshipId,
      studentId: paymentData.studentId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      status: paymentData.status,
      donationDate: new Date(),
      notes: paymentData.notes,
      isAnonymous: paymentData.isAnonymous
    });
    
    // Update total donated amount
    donor.totalDonated += paymentData.amount;
    
    await donor.save({ session });
    
    // Update scholarship counts
    const Scholarship = mongoose.model('Scholarship');
    const scholarship = await Scholarship.findById(paymentData.scholarshipId).session(session);
    
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }
    
    scholarship.fundedCount += 1;
    
    await scholarship.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    
    return payment[0];
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

// Static method to get payments by date range
paymentSchema.statics.getPaymentsByDateRange = async function(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();
  
  return this.find({
    paymentDate: { $gte: start, $lte: end }
  }).sort({ paymentDate: -1 });
};

// Aggregation method to get payment summary by status
paymentSchema.statics.getPaymentSummaryByStatus = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// Aggregation method to get payment summary by payment method
paymentSchema.statics.getPaymentSummaryByMethod = async function() {
  return this.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        paymentMethod: '$_id',
        count: 1,
        totalAmount: 1,
        percentage: { $multiply: [{ $divide: ['$count', { $sum: '$count' }] }, 100] },
        _id: 0
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// Aggregation method to get monthly payment trends
paymentSchema.statics.getMonthlyPaymentTrends = async function(year) {
  const targetYear = year || new Date().getFullYear();
  
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        paymentDate: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$paymentDate' },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        month: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    },
    { $sort: { month: 1 } }
  ]);
};

// Aggregation method to get top donors
paymentSchema.statics.getTopDonors = async function(limit = 10) {
  return this.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: '$donorId',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        lastDonation: { $max: '$paymentDate' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'donor'
      }
    },
    {
      $project: {
        donorId: '$_id',
        totalAmount: 1,
        count: 1,
        lastDonation: 1,
        donorName: {
          $cond: {
            if: { $eq: [{ $arrayElemAt: ['$donor.role', 0] }, 'individual'] },
            then: {
              $concat: [
                { $arrayElemAt: ['$donor.firstName', 0] },
                ' ',
                { $arrayElemAt: ['$donor.lastName', 0] }
              ]
            },
            else: { $arrayElemAt: ['$donor.organizationName', 0] }
          }
        },
        donorType: { $arrayElemAt: ['$donor.role', 0] },
        _id: 0
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit }
  ]);
};

// Create Payment model
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;