const express = require('express');
const donationController = require('../controllers/donationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/my-donations', donationController.getMyDonations);
router.get('/:id', donationController.getDonation);

module.exports = router; 