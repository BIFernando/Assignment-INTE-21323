const { Notification } = require('../models/index');

// ── GET MY NOTIFICATIONS ──────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({
      error: 'Server error.',
      details: err.message
    });
  }
};

// ── MARK A NOTIFICATION AS READ ──────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.update(
      { isRead: true },
      {
        where: {
          id: id,
          userId: req.user.id
        }
      }
    );

    res.status(200).json({
      message: 'Notification marked as read.'
    });

  } catch (err) {
    res.status(500).json({
      error: 'Server error.',
      details: err.message
    });
  }
};

// ── MARK ALL NOTIFICATIONS AS READ ──────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {

    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          isRead: false
        }
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read.'
    });

  } catch (err) {
    res.status(500).json({
      error: 'Server error.',
      details: err.message
    });
  }
};

// ── GET UNREAD NOTIFICATION COUNT ──────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {

    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.status(200).json({ count });

  } catch (err) {
    res.status(500).json({
      error: 'Server error.',
      details: err.message
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};