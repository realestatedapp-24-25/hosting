const express = require('express');
const instituteController = require('../controllers/instituteController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Create a new institute (logged-in user must be an institute)
router.post('/create', authController.restrictTo('institute'), instituteController.createInstitute);

// Get all institutes (admin only)
router
  .route('/')
  .get(authController.restrictTo('admin'), instituteController.getAllInstitutes);

// Get or update the logged-in institute's profile
router
  .route('/me')
  .get(authController.restrictTo('institute'), instituteController.getInstitute)
  .patch(authController.restrictTo('institute'), instituteController.updateInstitute);

// Get, update, or delete a specific institute (admin or the institute itself)
router
  .route('/:id')
  .get(authController.restrictTo('admin', 'institute'), instituteController.getInstitute) // Admin or the institute itself can fetch a specific institute
  .patch(authController.restrictTo('admin', 'institute'), instituteController.updateInstitute) // Admin or the institute itself can update a specific institute
  .delete(authController.restrictTo('admin'), instituteController.deleteInstitute); // Only admins can delete an institute

module.exports = router;