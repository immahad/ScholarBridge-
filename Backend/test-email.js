const { sendVerificationEmail } = require('./services/emailService');
const crypto = require('crypto');

// Mock user for testing
const testUser = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  verificationToken: crypto.randomBytes(32).toString('hex')
};

console.log('Starting email test with user:', {
  email: testUser.email,
  firstName: testUser.firstName,
  verificationToken: testUser.verificationToken
});

// Test sending verification email
sendVerificationEmail(testUser)
  .then(result => {
    console.log('Email send result:', result);
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to send email:', error);
    process.exit(1);
  });
