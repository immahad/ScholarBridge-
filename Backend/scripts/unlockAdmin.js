require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Admin = require('../models/Admin');

console.log('Starting admin unlock process...');
console.log('Connecting to MongoDB...');

// Connect to the database
mongoose.connect(config.db.uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find admin user
    const admin = await User.findOne({ 
      email: 'admin@example.com',
      role: 'admin'
    });
    
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    console.log('Found admin user:', admin._id);
    console.log('Current login attempts:', admin.loginAttempts);
    console.log('Current locked until:', admin.lockedUntil);
    
    // Reset login attempts and unlock account
    const updated = await User.updateOne(
      { _id: admin._id },
      { 
        $set: { 
          loginAttempts: 0,
          lockedUntil: null
        }
      }
    );
    
    console.log('Account unlocked:', updated.modifiedCount > 0 ? 'Success' : 'Failed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error unlocking admin user:', error.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
