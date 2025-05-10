const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Public routes
// Get featured scholarships (public)
router.get('/featured', scholarshipController.getFeaturedScholarships);

// Get scholarships by category (public)
router.get('/category/:category', scholarshipController.getScholarshipsByCategory);

// Get scholarship statistics (admin only)
router.get(
  '/stats',
  verifyToken,
  isAdmin,
  scholarshipController.getScholarshipStats
);

// Get all scholarships (public)
router.get('/', scholarshipController.getAllScholarships);

// Get scholarship by ID (public)
router.get('/:id', scholarshipController.getScholarshipById);

// Admin routes below
// Create new scholarship (admin only)
router.post(
  '/',
  verifyToken,
  isAdmin,
  validate(schemas.admin.createScholarship),
  scholarshipController.createScholarship
);

// Update scholarship (admin only)
router.put(
  '/:id',
  verifyToken,
  isAdmin,
  scholarshipController.updateScholarship
);

// Delete scholarship (admin only)
router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  scholarshipController.deleteScholarship
);

// Get scholarship applications (admin only)
router.get(
  '/:id/applications',
  verifyToken,
  isAdmin,
  scholarshipController.getScholarshipApplications
);

module.exports = router; 