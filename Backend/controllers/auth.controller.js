const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/email.service');

// ── LOGIN ──────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({
      where: { email: email, isActive: true }
    });

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token: token,
      isFirstLogin: user.isFirstLogin,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── RESET PASSWORD ──────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({
        error: 'Password must be at least 8 characters.'
      });

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.update(
      { passwordHash: hashed, isFirstLogin: false },
      { where: { id: req.user.id } }
    );

    res.status(200).json({ message: 'Password reset successfully.' });

  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── REGISTER ──────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        errorCode: 400,
        message: "Email already in use.",
      });
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: null,
      isFirstLogin: false,
      isActive: true,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: null },
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      errorCode: 500,
      message: "Registration failed. Please try again.",
    });
  }
};

// ── FORGOT PASSWORD ──────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({
        message: 'If that email exists, a reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({
      inviteToken: token,
      inviteExpiry: expiry
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (mailErr) {
      console.error('Reset email failed:', mailErr.message);
    }

    return res.json({
      message: 'If that email exists, a reset link has been sent.'
    });

  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ── RESET PASSWORD WITH TOKEN ──────────────────────────────────
const resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: { inviteToken: token }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    if (new Date() > new Date(user.inviteExpiry)) {
      return res.status(400).json({ message: 'Token has expired. Request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await user.update({
      passwordHash,
      inviteToken: null,
      inviteExpiry: null,
      isFirstLogin: false
    });

    return res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (err) {
    console.error('resetPasswordWithToken error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ── CHANGE PASSWORD ──────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current and new passwords are required.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Current password is incorrect.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({
      passwordHash: hashedPassword,
      isFirstLogin: false 
    });

    return res.json({
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({
      error: 'Server error.'
    });
  }
};

module.exports = { login, resetPassword, register, forgotPassword, resetPasswordWithToken, changePassword };

