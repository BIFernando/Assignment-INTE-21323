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

module.exports = { login, resetPassword };