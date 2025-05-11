const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, hasAdminPermission } = require('../middleware/roleCheck');

// Apply auth middleware to all routes
router.use(verifyToken, isAdmin);

// Get admin dashboard data
router.get('/dashboard', adminController.getDashboard);

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

// Generate system reports
router.post(
  '/reports',
  hasAdminPermission('generate_reports'),
  adminController.generateReport
);

// Get admin activity log
router.get('/activity-log', adminController.getActivityLog);

module.exports = router;
