const bcrypt   = require('bcrypt');
const { User } = require('../models/index');
const { sendWelcomeEmail } = require('../services/email.service');

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role)
      return res.status(400).json({ error: 'Name, email, and role are required.' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: 'Email is already in use.' });

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name, email, passwordHash, role,
      isFirstLogin: true,
      isActive: true,
    });

    await sendWelcomeEmail(email, name, tempPassword);

    res.status(201).json({
      message: 'User created successfully.',
      userId: newUser.id,
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'isFirstLogin', 'createdAt'],
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ error: 'User not found.' });

    await User.update({ name, role }, { where: { id } });
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ error: 'User not found.' });

    await User.update({ isActive: false }, { where: { id } });
    res.status(200).json({ message: 'User deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

module.exports = { createUser, getAllUsers, updateUser, deactivateUser };