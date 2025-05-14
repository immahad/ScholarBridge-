// models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'accepted', 'funded'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  // If funded, reference to payment
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  // Essays are now an array of objects with question and answer
  essays: [{
    question: String,
    answer: String,
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    }
  }],
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      }
    }
  ],
  // Track history of status changes
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'accepted', 'funded'],
      },
      date: {
        type: Date,
        default: Date.now
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  // Add reviewed fields
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  // Add funded fields
  fundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fundedAt: {
    type: Date
  }
}, { timestamps: true });

// Add indexes for efficient querying
ApplicationSchema.index({ studentId: 1, scholarshipId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedDate: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
