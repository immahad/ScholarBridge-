const mongoose = require('mongoose');
const User = require('./User');

/**
 * Admin Activity Schema - Embedded document
 * Used for tracking admin activities
 */
const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login', 
      'review_application', 
      'create_scholarship', 
      'update_scholarship',
      'delete_scholarship',
      'scholarship_approved',
      'scholarship_rejected',
      'review_scholarship',
      'generate_report',
      'update_profile',
      'other'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, { _id: true });

/**
 * Admin Schema
 * Extends User schema with admin-specific fields
 */
const adminSchema = new mongoose.Schema({
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  department: {
    type: String,
    trim: true
  },
  permissions: {
    manageStudents: {
      type: Boolean,
      default: true
    },
    manageDonors: {
      type: Boolean,
      default: true
    },
    manageScholarships: {
      type: Boolean,
      default: true
    },
    manageApplications: {
      type: Boolean,
      default: true
    },
    generateReports: {
      type: Boolean,
      default: true
    },
    manageAdmins: {
      type: Boolean,
      default: false
    }
  },
  activities: [activitySchema],
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Create Activity Log Method
adminSchema.methods.logActivity = async function(action, details, req) {
  const activity = {
    action,
    details,
    timestamp: new Date()
  };
  
  // Add request information if available
  if (req) {
    activity.ipAddress = req.ip;
    activity.userAgent = req.headers['user-agent'];
  }
  
  this.activities.push(activity);
  this.lastActive = new Date();
  
  return await this.save();
};

// Check if admin has permission for specific action
adminSchema.methods.hasPermission = function(permission) {
  // Super admins have all permissions
  if (this.adminLevel === 'super_admin') {
    return true;
  }
  
  // Check specific permission
  return this.permissions[permission] === true;
};

// Get recent activities
adminSchema.methods.getRecentActivities = function(limit = 10) {
  return this.activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Static method to find active admins
adminSchema.statics.findActiveAdmins = async function() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return this.find({
    lastActive: { $gte: oneMonthAgo }
  });
};

// Static method to find admin by activity
adminSchema.statics.findByActivity = async function(action, startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  
  return this.find({
    'activities.action': action,
    'activities.timestamp': { $gte: start, $lte: end }
  });
};

// Create Admin model as a discriminator of User model
const Admin = User.discriminator('admin', adminSchema);

module.exports = Admin; 