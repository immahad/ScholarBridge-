const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Apply auth middleware to all routes
router.use(verifyToken);

// Admin-only routes (most application routes are admin-only)
router.use(isAdmin);

// Get all applications (admin view)
router.get('/', applicationController.getAllApplications);

// Get application details
router.get('/:id', applicationController.getApplicationDetails);

// Review application (approve or reject)
router.put(
  '/:id/review',
  validate(schemas.admin.reviewApplication),
  applicationController.reviewApplication
);

// Get application statistics
router.get('/stats/overview', applicationController.getApplicationStats);

module.exports = router; 