const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskAssignment = sequelize.define('TaskAssignment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false
});

module.exports = TaskAssignment;
