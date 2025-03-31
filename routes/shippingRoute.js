const express = require('express');
const shippingController = require('../controllers/shippingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// Verify delivery using geolocation and photo
router.post(
    '/verify-delivery/:code',
    authController.restrictTo('shopkeeper'),
    shippingController.uploadDeliveryPhoto,
    shippingController.resizeDeliveryPhoto,
    shippingController.verifyDelivery
);

// Get delivery status
router.get(
    '/status/:code',
    shippingController.getDeliveryStatus
);

module.exports = router; 