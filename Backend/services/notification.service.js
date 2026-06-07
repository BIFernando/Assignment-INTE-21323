const { Notification } = require('../models/index');
const { sendNotification } = require('./socket.service');

// CREATE AND SEND A NOTIFICATION
async function createNotification(io, userId, message, type) {
  try {
    // Save notification to database
    const notification = await Notification.create({
      userId: userId,
      message: message,
      type: type,
      isRead: false,
    });

    // Send real-time notification
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