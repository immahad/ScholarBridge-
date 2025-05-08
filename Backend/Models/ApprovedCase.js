const mongoose = require('mongoose');

const ApprovedCaseSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    trim: true,
    lowercase: true
  },
  donorEmail: {
    type: String,
    required: [true, 'Donor email is required'],
    trim: true,
    lowercase: true
  },
  adminEmail: {
    type: String,
    required: [true, 'Admin email is required'],
    trim: true,
    lowercase: true
  },
  paymentProof: {
    type: String,
    required: [true, 'Payment proof is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  approvedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Approved',
    enum: ['Approved', 'Pending', 'Rejected']
  }
}, {
  timestamps: true,
  collection: 'approvedcases' // Explicitly set collection name
});

// Add middleware for logging
ApprovedCaseSchema.pre('save', function(next) {
  console.log('Saving ApprovedCase:', this);
  next();
});

ApprovedCaseSchema.post('save', function(doc) {
  console.log('Saved ApprovedCase:', doc);
});

const ApprovedCase = mongoose.model('approved_cases', ApprovedCaseSchema);
module.exports = ApprovedCase;
