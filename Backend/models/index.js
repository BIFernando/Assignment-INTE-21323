const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const TaskAssignment = require('./TaskAssignment');
const Comment = require('./Comment');
const Attachment = require('./Attachment');
const Notification = require('./Notification');

// Associations
User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Task.belongsToMany(User, { through: TaskAssignment, as: 'assignees', foreignKey: 'task_id' });
User.belongsToMany(Task, { through: TaskAssignment, as: 'assignedTasks', foreignKey: 'user_id' });

Task.hasMany(Comment, { foreignKey: 'task_id' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(Attachment, { foreignKey: 'task_id' });
Attachment.belongsTo(Task, { foreignKey: 'task_id' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Task,
  TaskAssignment,
  Comment,
  Attachment,
  Notification
};
