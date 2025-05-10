// backend/models/Scholarship.js
const mongoose = require('mongoose');

/**
 * Scholarship Criteria Schema - Embedded document
 * Used for defining eligibility criteria for scholarships
 */
const criteriaSchema = new mongoose.Schema({
  minGPA: {
    type: Number,
    min: [0, 'Minimum GPA cannot be negative'],
    max: [4, 'Maximum GPA cannot exceed 4']
  },
  maxFamilyIncome: {
    type: Number,
    min: [0, 'Family income cannot be negative']
  },
  requiredDocuments: [{
    type: String,
    trim: true
  }],
  fieldOfStudy: [{
    type: String,
    trim: true
  }],
  academicLevel: [{
    type: String,
    enum: ['undergraduate', 'graduate', 'doctoral', 'any'],
    default: 'any'
  }],
  minAge: {
    type: Number,
    min: [0, 'Minimum age cannot be negative']
  },
  maxAge: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any'
  },
  nationality: [{
    type: String,
    trim: true
  }],
  requiredEssays: [{
    question: {
      type: String,
      trim: true
    },
    wordLimit: {
      type: Number,
      min: [10, 'Word limit must be at least 10']
    }
  }],
  otherRequirements: {
    type: String,
    trim: true
  }
}, { _id: false });

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
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'closed'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Scholarship creator is required']
  },
  criteria: criteriaSchema,
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
  startDate: {
    type: Date,
    default: Date.now
  },
  maxApplicants: {
    type: Number,
    min: [1, 'Maximum applicants must be at least 1']
  },
  applicantCount: {
    type: Number,
    default: 0
  },
  approvedCount: {
    type: Number,
    default: 0
  },
  fundedCount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['academic', 'financial_need', 'merit', 'athletic', 'community', 'diversity', 'research', 'international', 'other'],
    default: 'academic'
  },
  tags: [{
    type: String,
    trim: true
  }],
  visible: {
    type: Boolean,
    default: true
  },
  featuredRank: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add text index for search
scholarshipSchema.index(
  { 
    title: 'text',
    description: 'text',
    'criteria.fieldOfStudy': 'text',
    tags: 'text'
  },
  {
    weights: {
      title: 10,
      'criteria.fieldOfStudy': 5,
      tags: 3,
      description: 1
    },
    name: 'ScholarshipTextIndex'
  }
);

// Create compound indexes for common queries
scholarshipSchema.index({ status: 1, deadlineDate: 1 });
scholarshipSchema.index({ category: 1 });
scholarshipSchema.index({ amount: -1 }); // For sorting by highest amount
scholarshipSchema.index({ deadlineDate: 1 }); // For sorting by upcoming deadlines
scholarshipSchema.index({ visible: 1, status: 1 });
scholarshipSchema.index({ featuredRank: -1 }); // For sorting featured scholarships

// Pre-save hook to validate criteria
scholarshipSchema.pre('save', function(next) {
  // Validate min and max age
  if (this.criteria && this.criteria.minAge && this.criteria.maxAge) {
    if (this.criteria.minAge > this.criteria.maxAge) {
      return next(new Error('Minimum age cannot be greater than maximum age'));
    }
  }
  
  next();
});

// Virtual for days until deadline
scholarshipSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.deadlineDate) return null;
  
  const today = new Date();
  const deadline = new Date(this.deadlineDate);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Method to check if scholarship is active
scholarshipSchema.methods.isActive = function() {
  return this.status === 'active' && this.deadlineDate > new Date() && this.visible;
};

// Method to update application counts
scholarshipSchema.methods.updateCounts = async function(status, increment = true) {
  const increment_val = increment ? 1 : -1;
  
  if (status === 'pending') {
    this.applicantCount += increment_val;
  } else if (status === 'approved') {
    this.approvedCount += increment_val;
  } else if (status === 'funded') {
    this.fundedCount += increment_val;
  }
  
  return await this.save();
};

// Static method to find active scholarships with criteria
scholarshipSchema.statics.findActiveScholarships = function(filters = {}) {
  const query = {
    status: 'active',
    deadlineDate: { $gt: new Date() },
    visible: true
  };
  
  // Apply additional filters if provided
  if (filters.category) query.category = filters.category;
  if (filters.minAmount) query.amount = { $gte: filters.minAmount };
  if (filters.maxAmount) {
    if (query.amount) {
      query.amount.$lte = filters.maxAmount;
    } else {
      query.amount = { $lte: filters.maxAmount };
    }
  }
  
  return this.find(query)
    .sort({ featuredRank: -1, deadlineDate: 1 });
};

// Static method to find scholarships by field of study
scholarshipSchema.statics.findByFieldOfStudy = function(field) {
  if (!field) return this.find({});
  
  return this.find({
    'criteria.fieldOfStudy': { $in: [field] }
  });
};

// Aggregation method to get scholarship statistics
scholarshipSchema.statics.getScholarshipStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        avgAmount: 1,
        minAmount: 1,
        maxAmount: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Aggregation method to get category distribution
scholarshipSchema.statics.getCategoryDistribution = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        scholarships: { $push: { id: '$_id', title: '$title' } }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        totalAmount: 1,
        scholarships: { $slice: ['$scholarships', 5] }, // Limit to 5 scholarships per category
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Create Scholarship model
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

module.exports = Scholarship;
