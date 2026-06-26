require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
require('./models/index');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();


app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));


app.use(express.json());

// ── ROUTES ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/uploads', express.static('uploads'));



// ── 404 HANDLER ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    errorCode: 404,
    message: 'Route not found.',
    description: req.originalUrl + ' does not exist on this server.'
  });
});

// ── GLOBAL ERROR HANDLER ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message === 'File type not allowed.') {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad Request',
      description: 'File type is not allowed. Use PDF, JPG, PNG, or DOC.'
    });
  }

  res.status(err.status || 500).json({
    errorCode: err.status || 500,
    message: err.message || 'Internal Server Error',
    description: 'An unexpected error occurred. Please try again.'
  });
});

// ── START SERVER ───────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log('Server is running on port ' + PORT);
    });
  })
  .catch(err => {
    console.error('Could not connect to database:', err);
  });