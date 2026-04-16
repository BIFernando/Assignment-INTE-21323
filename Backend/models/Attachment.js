const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  file_name: { type: DataTypes.STRING },
  file_url: { type: DataTypes.STRING },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Attachment;
