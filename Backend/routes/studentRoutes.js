const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');
const { isStudent, isDonor, isAdminOrDonor, isAnyUser } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Get student profile (student only)
router.get('/profile', verifyToken, isStudent, studentController.getProfile);

// Update student profile (student only)
router.put(
  '/profile',
  verifyToken,
  isStudent,
  validate(schemas.student.profile),
  studentController.updateProfile
);

// Add education history (student only)
router.post('/education', verifyToken, isStudent, studentController.addEducation);

// Update education history (student only)
router.put('/education/:id', verifyToken, isStudent, studentController.updateEducation);

// Delete education history (student only)
router.delete('/education/:id', verifyToken, isStudent, studentController.deleteEducation);

// Get available scholarships (student only)
router.get('/scholarships', verifyToken, isStudent, studentController.getAvailableScholarships);

// Get scholarship details (student only)
router.get('/scholarships/:id', verifyToken, isStudent, studentController.getScholarshipDetails);

// Apply for scholarship (student only)
router.post(
  '/scholarships/:id/apply',
  verifyToken,
  isStudent,
  validate(schemas.student.applyScholarship),
  studentController.applyForScholarship
);

// Get all student applications (student only)
router.get('/applications', verifyToken, isStudent, studentController.getApplications);

// Get application details (student only)
router.get('/applications/:id', verifyToken, isStudent, studentController.getApplicationDetails);

// Get student dashboard data (student only)
router.get('/dashboard', verifyToken, isStudent, studentController.getDashboard);

// Public student profile endpoint for donors and admins (must be LAST to avoid blocking other routes)
router.get('/:id', verifyToken, isAdminOrDonor, studentController.getStudentById);

module.exports = router;
