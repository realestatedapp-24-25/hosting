const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/checkout-session', paymentController.getCheckoutSession);
router.get('/donation', paymentController.createDonationCheckout);

module.exports = router; 