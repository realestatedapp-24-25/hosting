const express = require('express');
const shopController = require('../controllers/shopController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes that don't need role restriction
router.post('/', authController.restrictTo('shopkeeper'), shopController.createShop);

// Routes that need role restriction
router
  .route('/inventory')
  .get(authController.restrictTo('shopkeeper'), shopController.getInventory)
  .patch(authController.restrictTo('shopkeeper'), shopController.updateInventory);

router
  .route('/inventory/item')
  .post(authController.restrictTo('shopkeeper'), shopController.addInventoryItem);

router
  .route('/inventory/item/:itemId')
  .patch(authController.restrictTo('shopkeeper'), shopController.updateInventoryItem)
  .delete(authController.restrictTo('shopkeeper'), shopController.deleteInventoryItem);

// Shopkeeper order management routes
router
  .route('/orders')
  .get(authController.restrictTo('shopkeeper'), shopController.getShopOrders);

router
  .route('/orders/:status')
  .get(authController.restrictTo('shopkeeper'), shopController.getShopOrdersByStatus);

// Admin and shopkeeper routes
router
  .route('/:id')
  .get(authController.restrictTo('admin', 'shopkeeper'), shopController.getShop)
  .patch(authController.restrictTo('admin', 'shopkeeper'), shopController.updateShop)
  .delete(authController.restrictTo('admin'), shopController.deleteShop);

module.exports = router;
