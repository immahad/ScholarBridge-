/**
 * Test script to verify applications are properly saved to the applications collection
 * Run with: node scripts/test-application-storage.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship_management';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import models
const Student = require('../models/Student');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');

/**
 * Check if recent applications in student documents also exist in applications collection
 */
async function checkApplicationStorage() {
  try {
    console.log('Checking recent student applications...\n');
    
    // Get all students who have applied for scholarships
    const students = await Student.find({ 'scholarshipApplications.0': { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(5);
    
    if (students.length === 0) {
      console.log('No students with applications found');
      return;
    }
    
    console.log(`Found ${students.length} students with applications`);
    
    // Check each student's applications
    for (const student of students) {
      console.log(`\nStudent: ${student.firstName} ${student.lastName} (${student.email})`);
      console.log(`Total applications in student document: ${student.scholarshipApplications.length}`);
      
      // Get the 3 most recent applications for this student
      const recentApps = student.scholarshipApplications
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 3);
      
      for (const studentApp of recentApps) {
        const scholarshipId = studentApp.scholarshipId;
        
        // Get scholarship name
        const scholarship = await Scholarship.findById(scholarshipId);
        const scholarshipName = scholarship ? scholarship.title || scholarship.name : 'Unknown Scholarship';
        
        console.log(`\n  Application for: ${scholarshipName}`);
        console.log(`  Applied at: ${new Date(studentApp.appliedAt).toLocaleString()}`);
        console.log(`  Status: ${studentApp.status}`);
        
        // Check if application exists in applications collection
        const applicationInCollection = await Application.findOne({
          studentId: student._id,
          scholarshipId: scholarshipId
        });
        
        if (applicationInCollection) {
          console.log('  ✅ Found matching application in applications collection!');
          console.log(`  Collection application ID: ${applicationInCollection._id}`);
          console.log(`  Status: ${applicationInCollection.status}`);
          console.log(`  Applied date: ${new Date(applicationInCollection.appliedDate).toLocaleString()}`);
        } else {
          console.log('  ❌ No matching application found in applications collection');
          
          // Generate code to create the missing application
          console.log('\n  To fix this, you could run the following code:');
          console.log(`
  const newApplication = new Application({
    studentId: "${student._id}",
    scholarshipId: "${scholarshipId}",
    status: "${studentApp.status}",
    appliedDate: new Date("${studentApp.appliedAt}"),
    essays: ${JSON.stringify(studentApp.essays)},
    documents: ${JSON.stringify(studentApp.documents || [])},
    statusHistory: [{
      status: "${studentApp.status}",
      date: new Date("${studentApp.appliedAt}"),
      note: "Application submitted"
    }]
  });
  await newApplication.save();
  `);
        }
      }
    }
    
    // Count applications in collection vs in student documents
    const totalAppsInCollection = await Application.countDocuments();
    const totalAppsInStudents = await Student.aggregate([
      { $unwind: "$scholarshipApplications" },
      { $count: "total" }
    ]);
    
    const studentAppsCount = totalAppsInStudents.length > 0 ? totalAppsInStudents[0].total : 0;
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total applications in applications collection: ${totalAppsInCollection}`);
    console.log(`Total applications in student documents: ${studentAppsCount}`);
    
    if (totalAppsInCollection < studentAppsCount) {
      console.log(`\n⚠️ There are ${studentAppsCount - totalAppsInCollection} applications missing from the applications collection`);
    } else if (totalAppsInCollection > studentAppsCount) {
      console.log(`\n⚠️ There are ${totalAppsInCollection - studentAppsCount} extra applications in the applications collection`);
    } else {
      console.log('\n✅ The number of applications matches between collections!');
    }
    
  } catch (error) {
    console.error('Error checking applications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the check
console.log('🚀 Starting application storage check...\n');
checkApplicationStorage(); 