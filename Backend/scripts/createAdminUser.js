const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Admin user details
const adminData = {
  email: 'admin@example.com',
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  isVerified: true,
  adminLevel: 'super_admin',
  permissions: {
    manageStudents: true,
    manageDonors: true,
    manageScholarships: true,
    manageApplications: true,
    generateReports: true,
    manageAdmins: true
  }
};

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists. No action taken.');
      process.exit(0);
    }
    
    // Create new admin
    const admin = new Admin(adminData);
    
    // Save admin
    await admin.save();
    
    console.log('Admin user created successfully!');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin(); 