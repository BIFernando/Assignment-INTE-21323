const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(verifyToken);

router.get('/',           getMyNotifications);
router.get('/unread',     getUnreadCount);
router.put('/read-all',   markAllAsRead);
router.put('/:id/read',   markAsRead);

module.exports = router;