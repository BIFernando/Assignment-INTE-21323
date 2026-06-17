const sequelize     = require('../config/database');
const User          = require('./User');
const Task          = require('./Task');
const TaskAssignment = require('./TaskAssignment');
const Comment       = require('./Comment');
const Attachment    = require('./Attachment');
const Notification  = require('./Notification');
const Project       = require('./Project');
const ProjectMember = require('./ProjectMember');

// ── User ↔ Task ───────────────────────────────────────────
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// ── User ↔ Task (many-to-many via TaskAssignment) ─────────
User.belongsToMany(Task, {
  through: TaskAssignment,
  as: 'assignedTasks',
  foreignKey: 'userId',
  otherKey: 'taskId'
});
Task.belongsToMany(User, {
  through: TaskAssignment,
  as: 'assignees',
  foreignKey: 'taskId',
  otherKey: 'userId'
});

// ── Task ↔ Comment ────────────────────────────────────────
Task.hasMany(Comment,    { foreignKey: 'taskId', as: 'comments' });
Comment.belongsTo(Task,  { foreignKey: 'taskId' });
Comment.belongsTo(User,  { foreignKey: 'userId', as: 'author' });
User.hasMany(Comment,    { foreignKey: 'userId', as: 'comments' });

// ── Task ↔ Attachment ─────────────────────────────────────
Task.hasMany(Attachment,      { foreignKey: 'taskId',     as: 'attachments' });
Attachment.belongsTo(Task,    { foreignKey: 'taskId' });
Attachment.belongsTo(User,    { foreignKey: 'uploadedBy', as: 'uploader' });

// ── User ↔ Notification ───────────────────────────────────
User.hasMany(Notification,    { foreignKey: 'userId',        as: 'notifications' });
Notification.belongsTo(User,  { foreignKey: 'userId' });
Notification.belongsTo(Task,  { foreignKey: 'relatedTaskId', as: 'relatedTask' });

// ── Project ───────────────────────────────────────────────
Project.belongsTo(User,         { foreignKey: 'createdById', as: 'creator' });
Project.hasMany(ProjectMember,  { foreignKey: 'projectId',   as: 'members' });
Project.hasMany(Task,           { foreignKey: 'projectId',   as: 'tasks' });

// ── ProjectMember ─────────────────────────────────────────
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
ProjectMember.belongsTo(User,    { foreignKey: 'userId', as: 'user' });
User.hasMany(ProjectMember,      { foreignKey: 'userId', as: 'projectMemberships' });

// ── Task ↔ Project ────────────────────────────────────────
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

module.exports = {
  sequelize,
  User,
  Task,
  TaskAssignment,
  Comment,
  Attachment,
  Notification,
  Project,
  ProjectMember
};