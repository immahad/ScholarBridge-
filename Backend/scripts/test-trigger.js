/**
 * Script to test the application-submitted trigger webhook endpoint
 * This uses real data from the database to simulate an actual application submission
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Try to read the localtunnel URL from the saved file
let webhookUrl;
try {
  const urlFile = path.join(__dirname, 'localtunnel-url.txt');
  if (fs.existsSync(urlFile)) {
    webhookUrl = fs.readFileSync(urlFile, 'utf8').trim();
  }
} catch (error) {
  console.error('Error reading localtunnel URL:', error);
}

// Allow URL override via command line
if (process.argv.length > 2) {
  webhookUrl = process.argv[2];
}

if (!webhookUrl) {
  console.error('No webhook URL provided. Please run the localtunnel script first or provide a URL as an argument.');
  process.exit(1);
}

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship_management';

// Check email configuration
function validateEmailConfig() {
  const requiredEmailVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
  ];
  
  const missingVars = requiredEmailVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ WARNING: Missing email configuration variables:');
    missingVars.forEach(variable => {
      console.warn(`  - ${variable}`);
    });
    console.warn('\nEmails may not be sent properly. Check your .env file and add the missing variables.');
    console.warn('See README-triggers.md for more information on email configuration.\n');
    return false;
  }
  
  console.log('✅ Email configuration validated');
  return true;
}

// Validate email configuration
validateEmailConfig();

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import models
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

// Function to create a test application with real data
async function createTestApplication() {
  try {
    // Find a real student (preferably verified)
    let student = await Student.findOne({ isVerified: true }).sort({ createdAt: -1 });
    
    // If no verified student found, try any student
    if (!student) {
      console.log('No verified students found, trying any student');
      student = await Student.findOne().sort({ createdAt: -1 });
      
      if (!student) {
        console.error('No students found in the database');
        process.exit(1);
      }
    }
    console.log('Found student:', student.firstName, student.lastName, student.email);

    // Find a real scholarship (preferably active)
    let scholarship = await Scholarship.findOne({ status: 'active' }).sort({ createdAt: -1 });
    
    // If no active scholarship found, try any scholarship
    if (!scholarship) {
      console.log('No active scholarships found, trying any scholarship');
      scholarship = await Scholarship.findOne().sort({ createdAt: -1 });
      
      if (!scholarship) {
        console.error('No scholarships found in the database');
        process.exit(1);
      }
    }
    console.log('Found scholarship:', scholarship.name || scholarship.title);

    // Check if application already exists
    const existingApplication = await Application.findOne({
      studentId: student._id,
      scholarshipId: scholarship._id
    });

    if (existingApplication) {
      console.log('Application already exists, using it for testing');
      return {
        applicationId: existingApplication._id,
        studentId: student._id,
        scholarshipId: scholarship._id,
        application: existingApplication
      };
    }

    // Create a new test application document
    const newApplication = {
      studentId: student._id,
      scholarshipId: scholarship._id,
      status: 'pending',
      submittedAt: new Date(),
      academicInfo: {
        gpa: 3.8,
        major: student.academicInfo?.major || 'Computer Science'
      },
      personalStatement: 'This is a test application created by the testing script.',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database (uncomment if you want to actually create it)
    // const savedApplication = await new Application(newApplication).save();
    // console.log('Created new test application with ID:', savedApplication._id);
    // return {
    //   applicationId: savedApplication._id,
    //   studentId: student._id,
    //   scholarshipId: scholarship._id,
    //   application: savedApplication
    // };

    // Using an ObjectId without saving to database
    const testApplicationId = new mongoose.Types.ObjectId();
    newApplication._id = testApplicationId;

    return {
      applicationId: testApplicationId,
      studentId: student._id,
      scholarshipId: scholarship._id,
      application: newApplication
    };
  } catch (error) {
    console.error('Error creating test application:', error);
    process.exit(1);
  }
}

// Send test request to the webhook endpoint
async function testWebhook() {
  try {
    // First, test the simple test endpoint
    console.log(`Testing connection to webhook endpoint: ${webhookUrl}/api/triggers/test`);
    const testResponse = await axios.get(`${webhookUrl}/api/triggers/test`);
    console.log(`✅ Connection test successful: ${JSON.stringify(testResponse.data)}`);
    
    // Create test application with real data
    console.log('\nPreparing test with real database data...');
    const { applicationId, studentId, scholarshipId, application } = await createTestApplication();
    
    // Prepare payload
    const payload = {
      applicationId: applicationId.toString(),
      operationType: 'insert',
      fullDocument: application
    };
    
    console.log(`
🔍 Testing webhook with real data: ${webhookUrl}/api/triggers/application-submitted
📦 Using Student ID: ${studentId}
📦 Using Scholarship ID: ${scholarshipId}
📦 Using Application ID: ${applicationId}
`);
    
    // Send the webhook with real data
    const response = await axios.post(`${webhookUrl}/api/triggers/application-submitted`, payload);
    
    console.log(`
✅ Webhook test successful!
📄 Response status: ${response.status}
📄 Response data: ${JSON.stringify(response.data, null, 2)}
`);

    // Close mongoose connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Webhook test failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`Error: ${error.message}`);
    }
    
    console.log(`
⚠️ Make sure your backend server is running and the webhook endpoint is properly configured!
`);

    // Close mongoose connection on error
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (e) {
      // Ignore any errors during closing
    }
  }
}

console.log('🚀 Starting application submission trigger test with real data\n');
testWebhook(); 