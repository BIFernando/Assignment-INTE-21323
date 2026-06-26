const { Task, User, TaskAssignment } = require('../models/index');
const { Op } = require('sequelize');
const { createNotification } = require('../services/notification.service');

// ── XSS SANITIZATION ──────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
// ── CREATE TASK ────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, projectId, assigneeIds } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    const { ProjectMember } = require('../models/index');
    const membership = await ProjectMember.findOne({
      where: { projectId, userId: req.user.id }
    });

    if (!membership || membership.role === 'collaborator') {
      return res.status(403).json({
        error: 'Only project admins and managers can create tasks.'
      });
    }

    if (dueDate) {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        return res.status(400).json({ error: 'Due date cannot be in the past.' });
      }
    }

    const task = await Task.create({
      title: sanitize(title),
      description: sanitize(description) || null,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      dueDate: dueDate || null,
      projectId,
      createdBy: req.user.id,
    });

    if (assigneeIds && assigneeIds.length > 0) {
      const { TaskAssignment } = require('../models/index');
      const assignments = assigneeIds.map(userId => ({
        taskId: task.id,
        userId
      }));
      await TaskAssignment.bulkCreate(assignments);
    }

    const taskWithAssignees = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      message: 'Task created successfully.',
      task: taskWithAssignees,
    });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── GET ALL TASKS ──────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assigneeId, sortBy, order } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (req.query.projectId) {
      where.projectId = req.query.projectId;
    }


    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
          ...(assigneeId ? { where: { id: assigneeId } } : {}),
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [[sortBy || 'createdAt', order || 'DESC']],
    });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── GET SINGLE TASK ────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── UPDATE TASK ────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (req.user.role === 'collaborator') {
      if (!status) {
        return res.status(400).json({ error: 'Collaborators can only update task status.' });
      }
      await task.update({ status });
      return res.status(200).json({ message: 'Task status updated.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = sanitize(title);
    if (description !== undefined) updates.description = sanitize(description);
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    await task.update(updates);

    const taskWithAssignees = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignees'
        }
      ]
    });

    const io = req.app.get('io');

    if (taskWithAssignees && taskWithAssignees.assignees) {

      for (const assignee of taskWithAssignees.assignees) {

        await createNotification(
          io,
          assignee.id,
          'Task "' + task.title + '" status changed to ' + status,
          'STATUS_CHANGE'
        );
      }
    }

    res.status(200).json({
      message: 'Task updated successfully.'
    });


  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── DELETE TASK ────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { ProjectMember } = require('../models/index');
    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id }
    });

    if (!membership || membership.role === 'collaborator') {
      return res.status(403).json({
        error: 'Only project admins and managers can delete tasks.'
      });
    }

    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── ASSIGN USERS TO TASK ───────────────────────────────
const assignUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ error: 'No user IDs provided.' });
    }

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { ProjectMember } = require('../models/index');
    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id }
    });

    if (!membership || membership.role === 'collaborator') {
      return res.status(403).json({
        error: 'Only project admins and managers can assign tasks.'
      });
    }

    const numericIds = userIds.map(id => parseInt(id, 10));
    const users = await User.findAll({ where: { id: numericIds } });
    if (users.length !== numericIds.length) {
      return res.status(400).json({ error: 'One or more user IDs are invalid.' });
    }

    await task.setAssignees(users);

    res.status(200).json({ message: 'Task assigned successfully.' });
  } catch (err) {
    console.error('assignUsers error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};


module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignUsers,
};