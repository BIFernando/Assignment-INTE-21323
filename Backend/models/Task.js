const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'completed'),
    defaultValue: 'todo',
  },
  dueDate: {
    type: DataTypes.DATE,
    field: 'due_date',      // map to the actual column name
    allowNull: true,        // due_date is currently NOT NULL, but we'll allow null after altering table
  },
  createdById: {
    type: DataTypes.UUID,
    field: 'created_by',    // map to actual column name
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Tasks',
  timestamps: true,
  underscored: false,       // we already manually mapped, so keep false
});

module.exports = Task;