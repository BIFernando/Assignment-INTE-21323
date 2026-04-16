const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('assignment','status_change','comment','deadline') },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Notification;
