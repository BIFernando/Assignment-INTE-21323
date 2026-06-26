const express = require('express');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notification.controller');

router.use(verifyToken);


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/', getMyNotifications);
/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *       401:
 *         description: Unauthorized
 */
router.get('/unread', getUnreadCount);
/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/read-all', markAllAsRead);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', markAsRead);

module.exports = router;