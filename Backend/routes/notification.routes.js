const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth.middleware');

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(verifyToken);

// GET /api/notifications
router.get('/', getMyNotifications);

// GET /api/notifications/unread
router.get('/unread', getUnreadCount);

// PUT /api/notifications/read-all
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', markAsRead);

module.exports = router;