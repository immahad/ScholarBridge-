require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../models/User');
const Admin = require('../models/Admin');

console.log('Starting admin password verification process...');
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
    }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    console.log('Found admin user:', admin._id);
    console.log('Email:', admin.email);
    
    // Check the stored password hash
    const testPassword = 'Admin@123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('Password verification result:');
    console.log('------------------------------');
    console.log('Test password:', testPassword);
    console.log('Stored password hash (first 20 chars):', admin.password.substring(0, 20) + '...');
    console.log('Password matches:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match. Updating password...');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      // Update the admin user password
      await User.updateOne(
        { _id: admin._id },
        { 
          $set: { 
            password: hashedPassword,
            loginAttempts: 0,
            lockedUntil: null
          }
        }
      );
      
      console.log('Password updated successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying admin password:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
