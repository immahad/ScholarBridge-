const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');
const { isStudent } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Apply auth middleware to all routes
router.use(verifyToken, isStudent);

// Get student profile
router.get('/profile', studentController.getProfile);

// Update student profile
router.put(
  '/profile',
  validate(schemas.student.profile),
  studentController.updateProfile
);

// Add education history
router.post('/education', studentController.addEducation);

// Update education history
router.put('/education/:id', studentController.updateEducation);

// Delete education history
router.delete('/education/:id', studentController.deleteEducation);

// Get available scholarships
router.get('/scholarships', studentController.getAvailableScholarships);

// Get scholarship details
router.get('/scholarships/:id', studentController.getScholarshipDetails);

// Apply for scholarship
router.post(
  '/scholarships/:id/apply',
  validate(schemas.student.applyScholarship),
  studentController.applyForScholarship
);

// Get all student applications
router.get('/applications', studentController.getApplications);

// Get application details
router.get('/applications/:id', studentController.getApplicationDetails);

// Get student dashboard data
router.get('/dashboard', studentController.getDashboard);

module.exports = router;
