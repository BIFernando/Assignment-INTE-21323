const { Notification } = require('../models/index');
const { sendNotification } = require('./socket.service');

// ── CREATE NOTIFICATION ───────────────────────────────────
async function createNotification(io, userId, message, type) {
  try {
    const notification = await Notification.create({
      userId: userId,
      message: message,
      type: type,
      isRead: false,
    });

    sendNotification(io, userId, {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      isRead: false,
      createdAt: notification.createdAt,
    });

    return notification;

  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

module.exports = { createNotification };