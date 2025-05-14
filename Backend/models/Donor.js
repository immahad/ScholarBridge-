// backend/models/Donor.js
const mongoose = require('mongoose');

/**
 * Donation Schema - Embedded document
 * Used for tracking donations made by donors
 */
const donationSchema = new mongoose.Schema({
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [0, 'Donation amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'crypto', 'other'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  notes: String,
  receiptUrl: String,
  isAnonymous: {
    type: Boolean,
    default: false
  }
});

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true
  },
  donorType: {
    type: String,
    enum: ['individual', 'organization', 'corporate'],
    default: 'individual'
  },
  donationHistory: [donationSchema],
  totalDonated: {
    type: Number,
    default: 0
  },
  donationPreferences: {
    preferredPaymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal', 'crypto', 'other'],
      default: 'credit_card'
    },
    isRecurringDonor: {
      type: Boolean,
      default: false
    },
    preferAnonymous: {
      type: Boolean,
      default: false
    },
    receiveUpdates: {
      type: Boolean,
      default: true
    },
    communicationFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    }
  }
}, { timestamps: true });

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
