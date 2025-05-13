const mongoose = require('mongoose');
const { createUserWithProfile } = require('./database/transactions/userTransactions');
const config = require('./config/env');

// Connect to MongoDB
mongoose.connect(config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB for test'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Test data
const testBaseUserData = {
  email: 'testuser@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  phoneNumber: '1234567890',
  isActive: true,
  isVerified: false
};

const testProfileData = {
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  cnic: '12345-6789012-3',
  institution: 'Test University',
  program: 'Computer Science',
  currentYear: 3,
  expectedGraduationYear: 2025
};

// Run the test
async function runTest() {
  try {
    console.log('Starting user creation test...');
    console.log('Base user data:', { ...testBaseUserData, password: '[REDACTED]' });
    console.log('Profile data:', testProfileData);
    
    const user = await createUserWithProfile(testBaseUserData, testProfileData);
    
    console.log('User created successfully:', {
      id: user._id,
      email: user.email,
      role: user.role
    });
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Test completed successfully');
    return process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error);
    await mongoose.disconnect();
    return process.exit(1);
  }
}

// Run the test
runTest();
