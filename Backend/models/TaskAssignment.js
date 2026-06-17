const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskAssignment = sequelize.define('TaskAssignment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true , primaryKey: true },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
   tableName: 'TaskAssignment',
  timestamps: true
});

module.exports = TaskAssignment;
