const express = require('express');
const {
  getChats,
  getChat,
  createChat,
  addMessage,
  assignChat,
  closeChat,
  resolveChat,
  rateChat,
  getUnassignedChats,
  getChatAnalytics
} = require('../controllers/chatController');

const { protect, authorize } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// User routes
router.get('/', protect, getChats);
router.post('/', protect, createChat);
router.get('/:id', protect, getChat);
router.post('/:id/messages', protect, chatLimiter, addMessage);
router.put('/:id/close', protect, closeChat);
router.put('/:id/rate', protect, rateChat);

// Admin routes
router.get('/admin/unassigned', protect, authorize('admin'), getUnassignedChats);
router.get('/admin/analytics', protect, authorize('admin'), getChatAnalytics);
router.put('/:id/assign', protect, authorize('admin'), assignChat);
router.put('/:id/resolve', protect, authorize('admin'), resolveChat);

module.exports = router;