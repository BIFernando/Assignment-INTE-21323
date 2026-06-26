const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'project_manager', 'collaborator'),
    allowNull: true,
    defaultValue: null
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFirstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  inviteToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  inviteExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'User',  
  timestamps: true
});

module.exports = User;