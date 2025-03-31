const express = require('express');
const donorController = require('../controllers/donorController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Add this route for all authenticated users
router.get('/my-donations', donorController.getMyDonations);
router.get('/institute-donations', authController.restrictTo('institute'), donorController.getInstituteDonations);

router
  .route('/shop-donations')
  .get(
    authController.restrictTo('shopkeeper'),
    donorController.getShopDonations
  );
// Restrict routes to specific roles
router
  .route('/')
  .get(authController.restrictTo('admin'), donorController.getAllDonors)
  .post( donorController.createDonor);

router
  .route('/:id')
  .get(authController.restrictTo('admin', 'donor'), donorController.getDonor)
  .patch(authController.restrictTo('admin', 'donor'), donorController.updateDonor)
  .delete(authController.restrictTo('admin'), donorController.deleteDonor);

// Route to get shops near an institute
router.get('/institute/:id/nearby-shops', authController.restrictTo('donor','admin','institute','shopkeeper'), donorController.getShopsNearInstitute);

// Route to get shops with requested items
router.get('/institute/:instituteId/requested-items',  donorController.getShopsWithRequestedItems);

router.post('/institute/:instituteId/donate',donorController.createDonation);

module.exports = router;
