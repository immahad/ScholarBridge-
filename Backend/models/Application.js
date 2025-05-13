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
    enum: ['pending', 'approved', 'rejected', 'accepted'],
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
  // Add any additional fields that might be in the embedded schema
  essays: {
    type: Map,
    of: String
  },
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Track history of status changes
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'accepted'],
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
  ]
}, { timestamps: true });

// Add indexes for efficient querying
ApplicationSchema.index({ studentId: 1, scholarshipId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedDate: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
