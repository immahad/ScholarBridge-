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
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Scholarship creator is required'] 
  }
}, {
  timestamps: true
});

// Create Scholarship model
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

module.exports = Scholarship;
