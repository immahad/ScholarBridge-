require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const Admin = require('../models/Admin');
const { createUserWithProfile } = require('../database/transactions/userTransactions');

// Admin user data
const adminData = {
  email: 'admin@example.com',
  password: 'Admin@123',
  firstName: 'System',
  lastName: 'Admin',
  role: 'admin', 
  phoneNumber: '03301234567',
  isActive: true,
  isVerified: true,
  // Add admin specific fields
  adminLevel: 'super_admin',
  department: 'IT',
  permissions: {
    manageStudents: true,
    manageDonors: true,
    manageScholarships: true,
    manageApplications: true,
    generateReports: true,
    manageAdmins: true
  }
};

console.log('Starting admin seed process...');
console.log('Connecting to MongoDB...');

// Connect to the database
mongoose.connect(config.db.uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: adminData.email });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    console.log('Creating admin user...');
    
    // Create admin user
    const adminUser = await Admin.create({
      ...adminData,
      password: hashedPassword
    });
    
    console.log('Admin user created successfully');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: Admin@123 (not showing actual password for security)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error(err.stack);
  process.exit(1);
});