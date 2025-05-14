const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, isDonor, isDonorOrOwner } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');
const { isAdminOrDonor } = require('../middleware/roleCheck');

// Important: Specific routes need to come BEFORE wildcard routes (/:id)

// Public routes with specific paths
router.get('/featured', scholarshipController.getFeaturedScholarships);
router.get('/category/:category', scholarshipController.getScholarshipsByCategory);

// Admin-specific routes with specific paths
router.get('/stats', verifyToken, isAdmin, scholarshipController.getScholarshipStats);
router.get('/pending', verifyToken, isAdmin, scholarshipController.getPendingScholarships);

// Donor-specific routes
router.get('/donor', verifyToken, isDonor, scholarshipController.getScholarshipsByDonor);

// Admin-specific routes for pending scholarships
router.get('/pendingDetails/:id', verifyToken, isAdmin, scholarshipController.getPendingScholarshipDetails);

// Generic routes
router.get('/', scholarshipController.getAllScholarships);

// Create new scholarship (both admin and donor can create)
router.post(
  '/',
  verifyToken,
  isAdminOrDonor,
  validate(schemas.donor.createScholarship),
  scholarshipController.createScholarship
);

// Routes with :id parameter should be AFTER specific routes
router.get('/:id', verifyToken, scholarshipController.getScholarshipById);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  scholarshipController.updateScholarship
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  scholarshipController.deleteScholarship
);

router.get(
  '/:id/applications',
  verifyToken,
  isAdmin,
  scholarshipController.getScholarshipApplications
);

router.put(
  '/:id/review',
  verifyToken,
  isAdmin,
  scholarshipController.reviewScholarship
);

module.exports = router;