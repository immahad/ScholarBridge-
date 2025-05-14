// backend/models/Scholarship.js
const mongoose = require('mongoose');

/**
 * Scholarship Schema
 * Main schema for scholarship opportunities
 */
const scholarshipSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Scholarship title is required'], 
    trim: true 
  },
  name: { 
    type: String, 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Scholarship description is required'], 
    trim: true 
  },
  amount: { 
    type: Number, 
    required: [true, 'Scholarship amount is required'], 
    min: [0, 'Scholarship amount cannot be negative'] 
  },
  deadlineDate: { 
    type: Date, 
    required: [true, 'Application deadline is required'], 
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    } 
  },
  category: { 
    type: String, 
    enum: ['Engineering', 'Science', 'Arts', 'Business'], 
    required: [true, 'Scholarship category is required'] 
  },
  eligibilityRequirements: { 
    type: String, 
    required: [true, 'Eligibility requirements are required'], 
    trim: true 
  },
  // Advanced criteria fields
  criteria: {
    minGPA: { 
      type: Number,
      default: 0
    },
    requiredDocuments: { 
      type: [String],
      default: ['transcript']
    },
    eligibleInstitutions: { 
      type: [String],
      default: []
    },
    eligiblePrograms: { 
      type: [String],
      default: []
    },
    additionalCriteria: { 
      type: [String],
      default: []
    }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Scholarship creator is required'] 
  },
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'rejected', 'active', 'closed', 'expired'],
    default: 'pending_approval'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  applicantCount: {
    type: Number,
    default: 0
  },
  approvedCount: {
    type: Number,
    default: 0
  },
  approvedApplicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }
}, {
  timestamps: true
});

// Method to check if scholarship is active
scholarshipSchema.methods.isActive = function() {
  return this.status === 'active' && 
         this.deadlineDate > new Date() && 
         this.visible === true;
};

// Method to check if scholarship is expired
scholarshipSchema.methods.isExpired = function() {
  return this.deadlineDate <= new Date();
};

// Static method to find active scholarships
scholarshipSchema.statics.findActiveScholarships = function() {
  return this.find({
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  });
};

// Create Scholarship model
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

module.exports = Scholarship;
