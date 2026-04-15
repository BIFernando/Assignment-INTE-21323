const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin','project_manager','collaborator'), defaultValue: 'collaborator' },
  is_first_login: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = User;
