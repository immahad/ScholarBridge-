/**
 * Script to reset admin login attempts and unlock accounts
 * Run with: node scripts/resetAdminLoginAttempts.js admin@example.com
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

// Check for email argument
const adminEmail = process.argv[2];
if (!adminEmail) {
  console.error('Please provide an admin email address');
  console.error('Usage: node scripts/resetAdminLoginAttempts.js admin@example.com');
  process.exit(1);
}

// Connect to database
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetLoginAttempts() {
  try {
    // Find the admin user
    const admin = await User.findOne({ 
      email: adminEmail,
      role: 'admin'
    });

    if (!admin) {
      console.error(`No admin found with email: ${adminEmail}`);
      process.exit(1);
    }

    // Reset login attempts and unlock account
    const result = await User.updateOne(
      { _id: admin._id },
      { 
        $set: {
          loginAttempts: 0,
          lockedUntil: null
        }
      }
    );

    console.log(`Admin account updated: ${result.modifiedCount} document(s) modified`);
    console.log('Admin login attempts reset and account unlocked successfully');
  } catch (error) {
    console.error('Error resetting admin login attempts:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetLoginAttempts(); 