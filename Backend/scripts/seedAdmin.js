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
  isVerified: true
};

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
    
    // Create admin user
    const adminUser = await createUserWithProfile({
      ...adminData,
      password: hashedPassword,
      permissions: [
        'manage_users', 
        'manage_scholarships', 
        'approve_applications', 
        'manage_payments', 
        'generate_reports'
      ]
    });
    
    console.log('Admin user created successfully');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 