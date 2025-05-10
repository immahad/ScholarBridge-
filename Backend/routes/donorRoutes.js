const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { verifyToken } = require('../middleware/auth');
const { isDonor } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Apply auth middleware to all routes
router.use(verifyToken, isDonor);

// Get donor profile
router.get('/profile', donorController.getProfile);

// Update donor profile
router.put(
  '/profile',
  validate(schemas.donor.profile),
  donorController.updateProfile
);

// Get eligible students for donations
router.get('/eligible-students', donorController.getEligibleStudents);

// Get student details for donation
router.get('/students/:id', donorController.getStudentDetails);

// Make a donation
router.post(
  '/donate',
  validate(schemas.donor.makeDonation),
  donorController.makeDonation
);

// Get donation history
router.get('/donations', donorController.getDonationHistory);

// Get donation details
router.get('/donations/:id', donorController.getDonationDetails);

// Get donor dashboard data
router.get('/dashboard', donorController.getDashboard);

// Generate donation report
router.post('/reports', donorController.generateReport);

module.exports = router;
