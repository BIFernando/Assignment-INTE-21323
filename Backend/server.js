require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const sequelize = require('./config/database');
require('./models/index');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(morgan('dev'));

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(hpp());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'TMS Server is running!', security: 'Phase 7 hardening active' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    errorCode: 404,
    message: 'Route not found.',
    description: req.originalUrl + ' does not exist.'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    errorCode: err.status || 500,
    message: err.message || 'Internal Server Error',
    description: 'An unexpected error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
      console.log('Security: Helmet, CORS, HPP, Morgan active');
    });
  })
  .catch(err => console.error('Database connection failed:', err));
