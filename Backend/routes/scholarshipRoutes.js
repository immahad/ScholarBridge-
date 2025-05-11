const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, isDonor } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');
const { isAdminOrDonor } = require('../middleware/roleCheck');

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

// Get all public scholarships (for the "Find Scholarships" page)
router.get('/', scholarshipController.getAllScholarships);

// Get scholarship by ID (public)
router.get('/:id', scholarshipController.getScholarshipById);

// Donor-specific routes
// Get scholarships created by the logged-in donor
router.get('/donor', verifyToken, isDonor, scholarshipController.getScholarshipsByDonor);

// Admin routes below
// Create new scholarship (both admin and donor can create)
router.post(
  '/',
  verifyToken,
  isAdminOrDonor, // Use isAdminOrDonor to allow both admin and donors
  validate(schemas.donor.createScholarship), // Use donor-specific validation schema
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