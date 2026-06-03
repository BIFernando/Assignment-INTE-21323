const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const TaskAssignment = require('./TaskAssignment');
const Comment = require('./Comment');
const Attachment = require('./Attachment');
const Notification = require('./Notification');

// Associations

// Task creator
User.hasMany(Task, {
  foreignKey: 'createdById',
  as: 'createdTasks'
});

Task.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'creator'
});

// Task assignments
Task.belongsToMany(User, {
  through: TaskAssignment,
  as: 'assignees',
  foreignKey: 'taskId',
  otherKey: 'userId'
});

User.belongsToMany(Task, {
  through: TaskAssignment,
  as: 'assignedTasks',
  foreignKey: 'userId',
  otherKey: 'taskId'
});

// Comments
Task.hasMany(Comment, {
  foreignKey: 'taskId'
});

Comment.belongsTo(Task, {
  foreignKey: 'taskId'
});

Comment.belongsTo(User, {
  foreignKey: 'userId'
});

// Attachments
Task.hasMany(Attachment, {
  foreignKey: 'taskId'
});

Attachment.belongsTo(Task, {
  foreignKey: 'taskId'
});

Attachment.belongsTo(User, {
  foreignKey: 'uploadedBy'
});

// Notifications
User.hasMany(Notification, {
  foreignKey: 'userId'
});

Notification.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = {
  sequelize,
  User,
  Task,
  TaskAssignment,
  Comment,
  Attachment,
  Notification
};