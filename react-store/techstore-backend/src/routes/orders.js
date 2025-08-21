const express = require('express');
const {
  getOrders,
  getOrder,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  processStripePayment,
  processCubanPayment,
  getOrderAnalytics
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.get('/my-orders', protect, getMyOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Payment routes
router.post('/:id/pay/stripe', protect, processStripePayment);
router.post('/:id/pay/cuban', protect, processCubanPayment);

// Admin routes
router.get('/', protect, authorize('admin'), getOrders);
router.get('/analytics/stats', protect, authorize('admin'), getOrderAnalytics);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;