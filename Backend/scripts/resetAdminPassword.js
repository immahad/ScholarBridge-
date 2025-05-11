require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../models/User');
const Admin = require('../models/Admin');

const email = 'admin@example.com';
const newPassword = 'Admin@123';

// Connect to the database
mongoose.connect(config.db.uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update admin password
    const result = await User.updateOne(
      { email, role: 'admin' },
      { 
        $set: { 
          password: hashedPassword,
          loginAttempts: 0,
          lockedUntil: null,
          isActive: true,
          isVerified: true
        } 
      }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      console.log('No admin user found with email:', email);
    } else if (result.modifiedCount === 0) {
      console.log('Admin user found but no changes made');
    } else {
      console.log('Admin password reset successfully');
    }
    
    // Verify the updated user
    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    
    if (admin) {
      console.log('Admin user details:');
      console.log('- ID:', admin._id);
      console.log('- Email:', admin.email);
      console.log('- Active:', admin.isActive);
      console.log('- Verified:', admin.isVerified);
      console.log('- Login attempts:', admin.loginAttempts);
      
      // Test the password
      const testMatch = await bcrypt.compare(newPassword, admin.password);
      console.log('Password verification:', testMatch ? 'SUCCESS' : 'FAILED');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
