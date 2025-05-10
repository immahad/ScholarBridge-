// backend/models/Donor.js
const mongoose = require('mongoose');
const User = require('./User');

/**
 * Donation Schema - Embedded document
 * Used for tracking donations made by donors
 */
const donationSchema = new mongoose.Schema({
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: [true, 'Scholarship ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
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
  notes: {
    type: String,
    trim: true
  },
  receiptUrl: String,
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, { _id: true });

/**
 * Donor Schema
 * Extends User schema with donor-specific fields
 */
const donorSchema = new mongoose.Schema({
  donorType: {
    type: String,
    enum: ['individual', 'organization', 'corporate'],
    required: [true, 'Donor type is required']
  },
  organizationName: {
    type: String,
    trim: true,
    required: function() {
      return this.donorType !== 'individual';
    }
  },
  organizationRole: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  taxId: {
    type: String,
    trim: true
  },
  preferredCauses: [{
    type: String,
    trim: true
  }],
  donationHistory: [donationSchema],
  totalDonated: {
    type: Number,
    default: 0
  },
  donationPreferences: {
    preferredPaymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal', 'crypto', 'other']
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
  },
  profilePicture: String,
  websiteUrl: {
    type: String,
    trim: true
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  bio: {
    type: String,
    trim: true
  }
});

// Add text index for search
donorSchema.index(
  { 
    organizationName: 'text',
    bio: 'text',
    'address.city': 'text',
    'address.country': 'text',
    preferredCauses: 'text'
  },
  {
    weights: {
      organizationName: 10,
      preferredCauses: 8,
      'address.city': 5,
      'address.country': 3,
      bio: 2
    },
    name: 'DonorTextIndex'
  }
);

// Create compound indexes for common queries
donorSchema.index({ donorType: 1 });
donorSchema.index({ totalDonated: -1 }); // For sorting by highest donors
donorSchema.index({ 'donationHistory.status': 1 });
donorSchema.index({ 'donationHistory.donationDate': -1 });

// Virtual for full address
donorSchema.virtual('fullAddress').get(function() {
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

// Virtual for donor name (organization name or individual name)
donorSchema.virtual('displayName').get(function() {
  if (this.donorType !== 'individual' && this.organizationName) {
    return this.organizationName;
  }
  return this.fullName;
});

// Method to add a new donation
donorSchema.methods.addDonation = async function(donationData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create new donation
    const donation = {
      ...donationData,
      donationDate: new Date()
    };
    
    // Add to donation history
    this.donationHistory.push(donation);
    
    // Update total donated amount
    this.totalDonated += donation.amount;
    
    // Save donor
    await this.save({ session });
    
    // Update student application status
    const student = await mongoose.model('Student').findById(donation.studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    const applicationIndex = student.scholarshipApplications.findIndex(
      app => app.scholarshipId.toString() === donation.scholarshipId.toString()
    );
    
    if (applicationIndex === -1) {
      throw new Error('Scholarship application not found');
    }
    
    // Update application status to funded
    student.scholarshipApplications[applicationIndex].status = 'funded';
    student.scholarshipApplications[applicationIndex].fundedBy = this._id;
    student.scholarshipApplications[applicationIndex].fundedAt = new Date();
    
    await student.save({ session });
    
    // Create payment record
    await mongoose.model('Payment').create([{
      donorId: this._id,
      studentId: donation.studentId,
      scholarshipId: donation.scholarshipId,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod,
      transactionId: donation.transactionId,
      status: donation.status,
      notes: donation.notes,
      createdAt: new Date()
    }], { session });
    
    // Commit transaction
    await session.commitTransaction();
    
    return donation;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

// Method to get donations by status
donorSchema.methods.getDonationsByStatus = function(status) {
  if (status) {
    return this.donationHistory.filter(donation => donation.status === status);
  }
  return this.donationHistory;
};

// Static method to find donors by donation amount range
donorSchema.statics.findByDonationRange = async function(minAmount, maxAmount) {
  return this.find({
    totalDonated: {
      $gte: minAmount || 0,
      $lte: maxAmount || Number.MAX_SAFE_INTEGER
    }
  }).sort({ totalDonated: -1 });
};

// Static method to get donors who donated to a specific scholarship
donorSchema.statics.findDonorsByScholarship = async function(scholarshipId) {
  return this.find({
    'donationHistory.scholarshipId': mongoose.Types.ObjectId(scholarshipId)
  });
};

// Aggregation method to get donation statistics
donorSchema.statics.getDonationStats = async function() {
  return this.aggregate([
    { $unwind: '$donationHistory' },
    {
      $group: {
        _id: '$donorType',
        totalDonations: { $sum: 1 },
        totalAmount: { $sum: '$donationHistory.amount' },
        avgDonation: { $avg: '$donationHistory.amount' },
        minDonation: { $min: '$donationHistory.amount' },
        maxDonation: { $max: '$donationHistory.amount' },
        donors: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        donorType: '$_id',
        totalDonations: 1,
        totalAmount: 1,
        avgDonation: 1,
        minDonation: 1,
        maxDonation: 1,
        uniqueDonors: { $size: '$donors' },
        _id: 0
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// Aggregation method to get donation time series data
donorSchema.statics.getDonationTimeSeries = async function(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
  const end = endDate ? new Date(endDate) : new Date();
  
  return this.aggregate([
    { $unwind: '$donationHistory' },
    {
      $match: {
        'donationHistory.donationDate': { $gte: start, $lte: end },
        'donationHistory.status': 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$donationHistory.donationDate' },
          month: { $month: '$donationHistory.donationDate' }
        },
        totalAmount: { $sum: '$donationHistory.amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: 1
          }
        },
        totalAmount: 1,
        count: 1,
        _id: 0
      }
    }
  ]);
};

// Create Donor model as a discriminator of User model
const Donor = User.discriminator('donor', donorSchema);

module.exports = Donor;
