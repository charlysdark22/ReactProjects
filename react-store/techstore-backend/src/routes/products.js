const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  updateStock,
  getProductAnalytics
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/search/:query', searchProducts);
router.get('/analytics', protect, authorize('admin'), getProductAnalytics);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.put('/:id/stock', protect, authorize('admin'), updateStock);

module.exports = router;