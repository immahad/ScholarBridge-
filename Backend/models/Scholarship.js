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
    enum: [
      'Engineering',
      'Science',
      'Arts',
      'Business',
      'Medicine',
      'Law',
      'Education',
      'Social Sciences',
      'Humanities',
      'Technology',
      'Computer Science',
      'Mathematics',
      'Other'
    ], 
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

// Static method to fix all scholarships in the database
scholarshipSchema.statics.fixAllScholarships = async function() {
  console.log('Starting scholarship fixing process');
  
  // 1. Find active scholarships that are not visible (they should be visible)
  const activeButNotVisible = await this.find({
    status: 'active',
    visible: false
  });
  
  console.log(`Found ${activeButNotVisible.length} active scholarships that are not visible`);
  
  // Make active scholarships visible
  for (const scholarship of activeButNotVisible) {
    scholarship.visible = true;
    await scholarship.save();
    console.log(`Fixed visibility for scholarship: ${scholarship._id} - ${scholarship.title}`);
  }
  
  // 2. Find scholarships that were approved (have approvedBy and approvedAt) but don't have the right status
  const approvedButWrongStatus = await this.find({
    approvedBy: { $exists: true, $ne: null },
    approvedAt: { $exists: true, $ne: null },
    $or: [
      { status: { $ne: 'active' } },
      { visible: false }
    ],
    status: { $ne: 'rejected' } // Don't modify rejected scholarships
  });
  
  console.log(`Found ${approvedButWrongStatus.length} approved scholarships with wrong status/visibility`);
  
  // Make approved scholarships active and visible
  for (const scholarship of approvedButWrongStatus) {
    scholarship.status = 'active';
    scholarship.visible = true;
    await scholarship.save();
    console.log(`Fixed status for scholarship: ${scholarship._id} - ${scholarship.title}`);
  }
  
  // Return stats about fixed scholarships
  return {
    activeFixed: activeButNotVisible.length,
    approvedFixed: approvedButWrongStatus.length,
    totalFixed: activeButNotVisible.length + approvedButWrongStatus.length
  };
};

// Create Scholarship model
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

module.exports = Scholarship;
