const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { isDonor, isAdmin } = require('../middleware/roleCheck');
const { validate, schemas } = require('../middleware/validation');

// Public routes
// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// Protected routes
// Get payment options
router.get('/options', verifyToken, paymentController.getPaymentOptions);

// Create payment intent (for Stripe)
router.post('/create-payment-intent', verifyToken, isDonor, paymentController.createPaymentIntent);

// Make a donation to a scholarship
router.post('/make-donation', verifyToken, isDonor, paymentController.makeDonation);

// Get donor's payment history
router.get('/history', verifyToken, isDonor, paymentController.getDonorPaymentHistory);

// Check payment status 
router.get('/status/:transactionId', verifyToken, paymentController.checkPaymentStatus);

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