// backend/models/Student.js
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');
const User = require('./User');

const ScholarshipApplicationSchema = new mongoose.Schema({
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
  }
}, { _id: true });

const FeeDetailsSchema = new mongoose.Schema({
  semester: {
    type: String,
    required: true
  },
  tuitionFee: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Tuition fee must be positive'
    }
  },
  otherFees: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'waived'],
    default: 'pending'
  },
  receipt: {
    type: String // URL to uploaded receipt
  }
}, { _id: true });

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
});

/**
 * Education Schema - Embedded document
 * Used for tracking student's educational background
 */
const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  isCurrentlyStudying: {
    type: Boolean,
    default: false
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot be greater than 4']
  },
  description: {
    type: String,
    trim: true
  },
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: true });

/**
 * Financial Information Schema - Embedded document
 * Used for tracking student's financial information
 */
const financialInfoSchema = new mongoose.Schema({
  familyIncome: {
    type: Number,
    min: [0, 'Family income cannot be negative']
  },
  dependentFamilyMembers: {
    type: Number,
    min: [1, 'Number of dependent family members must be at least 1']
  },
  fafsaCompleted: {
    type: Boolean,
    default: false
  },
  externalAidAmount: {
    type: Number,
    min: [0, 'External aid amount cannot be negative'],
    default: 0
  },
  hasSiblingsInSchool: {
    type: Boolean,
    default: false
  },
  numberOfSiblingsInSchool: {
    type: Number,
    default: 0,
    min: [0, 'Number of siblings cannot be negative']
  },
  isEmployed: {
    type: Boolean,
    default: false
  },
  employmentDetails: {
    employer: String,
    position: String,
    monthlySalary: Number
  },
  otherScholarships: [{
    name: String,
    amount: Number,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  }],
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
});

/**
 * Scholarship Application Schema - Embedded document
 * Used for tracking student's scholarship applications
 */
const scholarshipApplicationSchema = new mongoose.Schema({
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: [true, 'Scholarship ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'funded', 'completed'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  fundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  },
  fundedAt: Date,
  comments: {
    type: String,
    trim: true
  },
  essays: [{
    question: String,
    answer: String
  }],
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: true });

/**
 * Student Schema
 * Extends User schema with student-specific fields
 */
const studentSchema = new mongoose.Schema({
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    required: [true, 'Gender is required']
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    validate: {
      validator: function(value) {
        return /^\d{5}-\d{7}-\d{1}$/.test(value);
      },
      message: props => `${props.value} is not a valid CNIC format. Use the format: xxxxx-xxxxxxx-x`
    },
    trim: true,
    unique: true
  },
  institution: {
    type: String,
    required: [true, 'Current institution is required'],
    trim: true
  },
  program: {
    type: String,
    required: [true, 'Current program is required'],
    trim: true
  },
  currentYear: {
    type: Number,
    required: [true, 'Current year of study is required'],
    min: [1, 'Current year must be at least 1']
  },
  expectedGraduationYear: {
    type: Number,
    required: [true, 'Expected graduation year is required']
  },
  currentGPA: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot be greater than 4']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  education: [educationSchema],
  financialInfo: financialInfoSchema,
  scholarshipApplications: [scholarshipApplicationSchema],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profileCompletionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  bio: {
    type: String,
    trim: true
  },
  profilePicture: String,
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  }
});

// Add text index for search
studentSchema.index(
  { 
    institution: 'text',
    program: 'text',
    bio: 'text',
    'address.city': 'text',
    'address.country': 'text'
  },
  {
    weights: {
      institution: 10,
      program: 8,
      'address.city': 5,
      'address.country': 3,
      bio: 1
    },
    name: 'StudentTextIndex'
  }
);

// Create compound indexes for common queries
studentSchema.index({ institution: 1, program: 1 });
studentSchema.index({ 'scholarshipApplications.status': 1 });
studentSchema.index({ 'scholarshipApplications.scholarshipId': 1 });
studentSchema.index({ profileCompleted: 1 });
studentSchema.index({ 'financialInfo.familyIncome': 1 });
studentSchema.index({ cnic: 1 }, { unique: true });

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  const address = this.address;
  if (!address) return '';
  
  return [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].filter(Boolean).join(', ');
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Method to check if student can apply for a scholarship
studentSchema.methods.canApplyForScholarship = function(scholarship) {
  // Check if student has already applied for this scholarship
  const alreadyApplied = this.scholarshipApplications.some(
    app => app.scholarshipId.toString() === scholarship._id.toString()
  );
  
  if (alreadyApplied) {
    return {
      canApply: false,
      reason: 'Already applied for this scholarship'
    };
  }
  
  // Check if student profile is complete
  if (!this.profileCompleted) {
    return {
      canApply: false,
      reason: 'Profile is not complete'
    };
  }
  
  // Check scholarship criteria
  // This is a simplified version - real implementation would be more complex
  if (scholarship.criteria && scholarship.criteria.minGPA) {
    if (this.currentGPA < scholarship.criteria.minGPA) {
      return {
        canApply: false,
        reason: `GPA below minimum requirement of ${scholarship.criteria.minGPA}`
      };
    }
  }
  
  return { canApply: true };
};

// Method to get applications by status
studentSchema.methods.getApplicationsByStatus = function(status) {
  if (status) {
    return this.scholarshipApplications.filter(app => app.status === status);
  }
  return this.scholarshipApplications;
};

// Static method to find students eligible for a specific scholarship
studentSchema.statics.findEligibleStudents = async function(scholarshipId) {
  const scholarship = await mongoose.model('Scholarship').findById(scholarshipId);
  if (!scholarship) throw new Error('Scholarship not found');
  
  // Build query based on scholarship criteria
  const query = { 
    profileCompleted: true,
    // Filter out students who already applied
    scholarshipApplications: { 
      $not: { 
        $elemMatch: { scholarshipId: mongoose.Types.ObjectId(scholarshipId) } 
      }
    }
  };
  
  // Add GPA criteria if present
  if (scholarship.criteria && scholarship.criteria.minGPA) {
    query.currentGPA = { $gte: scholarship.criteria.minGPA };
  }
  
  // Add other criteria as needed
  
  return this.find(query);
};

// Aggregation method to get scholarship application statistics
studentSchema.statics.getApplicationStats = async function() {
  return this.aggregate([
    { $unwind: '$scholarshipApplications' },
    { 
      $group: {
        _id: '$scholarshipApplications.status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

// Create Student model as a discriminator of User model
const Student = User.discriminator('student', studentSchema);

module.exports = Student;