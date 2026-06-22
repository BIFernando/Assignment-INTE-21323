const bcrypt   = require('bcrypt');
const { User } = require('../models/index');
const { sendWelcomeEmail } = require('../services/email.service');

// ── CREATE USER ────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role)
      return res.status(400).json({ error: 'Name, email, and role are required.' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: 'Email is already in use.' });

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      isFirstLogin: true,
      isActive:     true,
    });

    // Send welcome email — wrapped so mail failure doesn't fail user creation
    try {
      await sendWelcomeEmail(email, name, tempPassword);
    } catch (mailErr) {
      console.error('Welcome email failed to send:', mailErr.message);
    }

    res.status(201).json({
      message: 'User created successfully.',
      userId:  newUser.id,
    });

  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── GET ALL USERS ──────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'name', 'email', 'role',
        'isActive', 'isFirstLogin', 'createdAt'
      ],
    });
    res.status(200).json(users);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── UPDATE USER ────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { id }       = req.params;
    const { name, role } = req.body;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ error: 'User not found.' });

    await User.update({ name, role }, { where: { id } });
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── DEACTIVATE USER ────────────────────────────────────
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ error: 'User not found.' });

    await User.update({ isActive: false }, { where: { id } });
    res.status(200).json({ message: 'User deactivated successfully.' });
  } catch (err) {
    console.error('deactivateUser error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── SEARCH USERS BY EMAIL ──────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email)
      return res.status(400).json({ message: 'Email query is required.' });

    const user = await User.findOne({
      where: { email, isActive: true },
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user)
      return res.status(404).json({ message: 'No user found with that email.' });

    return res.json(user);
  } catch (err) {
    console.error('searchUsers error:', err);
    return res.status(500).json({ message: 'Search failed.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required.' });
    }

    await User.update(
      { name: name.trim() },
      { where: { id: req.user.id } }
    );

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    return res.json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });

  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Could not update profile.' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  searchUsers,
  updateProfile
};