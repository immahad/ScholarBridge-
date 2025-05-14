/**
 * Migration script to move applications from student documents to the applications collection
 * Run with: node scripts/migrate-applications.js
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

/**
 * Migrate applications from student documents to the applications collection
 */
async function migrateApplications() {
  try {
    console.log('Starting applications migration...\n');
    
    // Get all students who have applied for scholarships
    const students = await Student.find({ 'scholarshipApplications.0': { $exists: true } });
    
    if (students.length === 0) {
      console.log('No students with applications found');
      return;
    }
    
    console.log(`Found ${students.length} students with applications`);
    
    let totalApplications = 0;
    let migratedCount = 0;
    let alreadyExistCount = 0;
    let errorCount = 0;
    
    // Process each student's applications
    for (const student of students) {
      console.log(`\nMigrating applications for student: ${student.firstName} ${student.lastName} (${student.email})`);
      console.log(`Total applications for this student: ${student.scholarshipApplications.length}`);
      
      totalApplications += student.scholarshipApplications.length;
      
      for (const studentApp of student.scholarshipApplications) {
        const scholarshipId = studentApp.scholarshipId;
        
        try {
          // Check if application already exists in applications collection
          const existingApp = await Application.findOne({
            studentId: student._id,
            scholarshipId: scholarshipId
          });
          
          if (existingApp) {
            console.log(`  ✓ Application for scholarship ${scholarshipId} already exists in collection`);
            alreadyExistCount++;
            continue;
          }
          
          // Create new application in collection
          const newApplication = new Application({
            studentId: student._id,
            scholarshipId: scholarshipId,
            status: studentApp.status,
            appliedDate: studentApp.appliedAt,
            essays: studentApp.essays || [],
            documents: studentApp.documents || [],
            statusHistory: [{
              status: studentApp.status,
              date: studentApp.appliedAt,
              note: 'Application submitted'
            }],
            reviewedBy: studentApp.reviewedBy,
            reviewedAt: studentApp.reviewedAt,
            fundedBy: studentApp.fundedBy,
            fundedAt: studentApp.fundedAt
          });
          
          await newApplication.save();
          console.log(`  ✅ Migrated application for scholarship ${scholarshipId}`);
          migratedCount++;
        } catch (error) {
          console.error(`  ❌ Error migrating application for scholarship ${scholarshipId}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Total applications found: ${totalApplications}`);
    console.log(`Already in collection: ${alreadyExistCount}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️ Migration completed with some errors. Check the logs above.');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the migration
console.log('🚀 Starting application migration...\n');
migrateApplications(); 