// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * User Schema
 * Base schema for all users (Students, Donors, Admins)
 * Uses discriminator pattern for inheritance
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please provide a valid email'
    ],
    index: true, // Add index for email field for faster lookups
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password in queries
  },
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'donor', 'admin'],
    required: [true, 'Please specify user role'],
    index: true // Add index for role field for faster lookups
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  // For refresh token rotation
  tokenVersion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  discriminatorKey: 'role' // Field used for inheritance/discriminator
});

// Create indexes for frequently queried fields
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, role: 1 });
userSchema.index({ createdAt: -1 }); // For sorting by newest users

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      role: this.role,
      tokenVersion: this.tokenVersion
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expire,
      issuer: 'scholarship-management-system',
      audience: 'sms-users'
    }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      tokenVersion: this.tokenVersion
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpire,
      issuer: 'scholarship-management-system',
      audience: 'sms-users'
    }
  );
};

// Static method to find users by email with case-insensitive search
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to increment login attempts
userSchema.statics.incrementLoginAttempts = async function(email) {
  const user = await this.findOne({ email });
  if (!user) return null;
  
  user.loginAttempts += 1;
  
  // Lock account if more than 5 failed attempts
  if (user.loginAttempts >= 5) {
    // Lock for 15 minutes
    user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  await user.save();
  return user;
};

// Static method to reset login attempts
userSchema.statics.resetLoginAttempts = async function(userId) {
  return await this.findByIdAndUpdate(
    userId,
    { 
      $set: { 
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    },
    { new: true }
  );
};

// Export model
const User = mongoose.model('User', userSchema);

module.exports = User;
