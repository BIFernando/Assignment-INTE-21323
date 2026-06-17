const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { User } = require('../models/index');


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
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

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

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        errorCode: 400,
        message: "Email already in use.",
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user (no role yet — assigned per project)
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: null,
      isFirstLogin: false,
      isActive: true,
    });

    // Generate JWT
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

// Add register to your exports
module.exports = { login, resetPassword, register };


