const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminScholarshipController = require('../controllers/adminScholarshipController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, hasAdminPermission } = require('../middleware/roleCheck');

// Apply auth middleware to all routes
router.use(verifyToken, isAdmin);

// Get admin dashboard data
router.get('/dashboard', adminDashboardController.getDashboard);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get user by ID
router.get('/users/:id', adminController.getUserById);

// Update user
router.put('/users/:id', adminController.updateUser);

// Deactivate user
router.put('/users/:id/deactivate', adminController.deactivateUser);

// Activate user
router.put('/users/:id/activate', adminController.activateUser);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

// Get admin profile
router.get('/profile', adminController.getProfile);

// Update admin profile
router.put('/profile', adminController.updateProfile);

// Change admin password
router.put('/change-password', adminController.changePassword);

// Generate system reports
router.post(
  '/reports',
  hasAdminPermission('generate_reports'),
  adminController.generateReport
);

// Get admin activity log
router.get('/activity-log', adminController.getActivityLog);

// Get all students with pagination and filters
router.get('/students', adminController.getAllStudents);

// Get student by ID
router.get('/students/:id', adminController.getStudentById);

// Create new scholarship
router.post('/scholarships', adminController.createScholarship);

// Get all scholarships (including created by donors)
router.get('/scholarships', adminController.getAllScholarships);

// Get scholarship by ID (admin view - important for viewing pending scholarships)
router.get('/scholarships/:id', adminController.getScholarshipById);

// Update scholarship
router.put('/scholarships/:id', adminController.updateScholarship);

// Delete scholarship
router.delete('/scholarships/:id', adminController.deleteScholarship);

// Scholarship approval route
router.put('/scholarships/:id/review', adminController.reviewScholarship);

// Utility route to fix scholarship visibility and status issues
router.post('/scholarships/fix', adminScholarshipController.fixScholarships);

// Check database connection (for troubleshooting)
router.get('/system/db-check', async (req, res) => {
  try {
    const { checkDatabaseConnection } = require('../utils/dbCheck');
    const result = await checkDatabaseConnection();
    return res.status(200).json({
      success: true,
      dbStatus: result
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking database connection',
      error: error.message
    });
  }
});

module.exports = router;
