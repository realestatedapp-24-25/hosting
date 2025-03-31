const express = require('express');
const requestController = require('../controllers/requestController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router
  .route('/my-requests')
  .get(

    authController.restrictTo('institute'),
    requestController.getMyRequests
  );
  router
  .route('/search')
  .get(
    authController.protect, 
    authController.restrictTo('admin', 'donor', 'institute','shopkeeper'),
    requestController.searchRequests
  );
// Add this new route for getting request with nearby shops
router.get('/:id/shops', requestController.getRequestWithShops);

// Routes for requests


router
  .route('/')
  .get(authController.restrictTo('admin', 'institute', 'shopkeeper', 'donor'), requestController.getAllRequests)
  .post(authController.restrictTo('institute'), requestController.createRequest);

router
  .route('/:id')
  .get(authController.restrictTo('admin', 'institute', 'shopkeeper', 'donor'), requestController.getRequest)
 


module.exports = router; 