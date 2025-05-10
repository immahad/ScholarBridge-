const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { isDonor, isAdmin } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.get('/options', paymentController.getPaymentOptions);

// Protected routes - require authentication
router.use(verifyToken);

// Donor routes - make donation
router.post(
  '/donate',
  isDonor,
  validate(schemas.payment.makeDonation),
  paymentController.makeDonation
);

// Get donor's payment history
router.get('/history', isDonor, paymentController.getDonorPaymentHistory);

// Get payment details
router.get('/:id', paymentController.getPaymentDetails);

// Admin routes - need admin role
router.use(isAdmin);

// Get all payments with filters
router.get('/', paymentController.getAllPayments);

// Update payment status
router.put(
  '/:id/status',
  validate(schemas.payment.updateStatus),
  paymentController.updatePaymentStatus
);

// Process refund
router.post(
  '/:id/refund',
  validate(schemas.payment.refundPayment),
  paymentController.refundPayment
);

// Get payment statistics
router.get('/stats/overview', paymentController.getPaymentStats);

module.exports = router; 