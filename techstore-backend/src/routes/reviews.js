const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  unmarkHelpful,
  reportReview,
  moderateReview,
  getReviewsForModeration,
  getReviewStats
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/auth');
const { reviewLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/stats/:productId', getReviewStats);
router.get('/:id', getReview);

// Protected routes
router.post('/', protect, reviewLimiter, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);
router.delete('/:id/helpful', protect, unmarkHelpful);
router.put('/:id/report', protect, reportReview);

// Admin routes
router.get('/moderation/pending', protect, authorize('admin'), getReviewsForModeration);
router.put('/:id/moderate', protect, authorize('admin'), moderateReview);

module.exports = router;