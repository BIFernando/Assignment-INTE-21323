const { Task, User, TaskAssignment } = require('../models/index');
const { Op } = require('sequelize');
const { createNotification } = require('../services/notification.service');

// Simple XSS sanitiser
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
    const { title, description, priority, status, dueDate, assigneeIds } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
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
  title:       sanitize(title),
  description: sanitize(description),
  priority:    priority || 'MEDIUM',
  status:      status   || 'TODO',
  dueDate:     dueDate  || null,
  createdById: req.user.id,
});

    if (assigneeIds && assigneeIds.length > 0) {
      const assignments = assigneeIds.map(userId => ({
        taskId: task.id,
        userId: userId,
      }));
      await TaskAssignment.bulkCreate(assignments);
       const io = req.app.get('io');

  for (const userId of assigneeIds) {
    await createNotification(
      io,
      userId,
      'You have been assigned a new task: ' + title,
      'ASSIGNMENT'
    );
  }
    }

    res.status(201).json({
      message: 'Task created successfully.',
      task: task,
    });
  } catch (err) {
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

    if (req.user.role === 'COLLABORATOR') {
      if (!status) {
        return res.status(400).json({ error: 'Collaborators can only update task status.' });
      }
      await task.update({ status });
      return res.status(200).json({ message: 'Task status updated.' });
    }
await task.update({
  title,
  description,
  priority,
  status,
  dueDate
});

// Load task with assignees
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

    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
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

    const users = await User.findAll({ where: { id: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'One or more user IDs are invalid.' });
    }

    await TaskAssignment.destroy({ where: { taskId: id } });
    const assignments = userIds.map(userId => ({ taskId: id, userId }));
    await TaskAssignment.bulkCreate(assignments);

    res.status(200).json({ message: 'Task assigned successfully.' });
  } catch (err) {
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