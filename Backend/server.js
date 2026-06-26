require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const sequelize = require('./config/database');
require('./models/index');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const notificationRoutes = require('./routes/notification.routes');
const projectRoutes = require('./routes/Project.routes'); // ← ADD THIS

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://taskflowtms.sytes.net',
      'http://taskflowtms.sytes.net:3000',
      'https://taskflowtms.sytes.net',
      process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.set('io', io);

const { initializeSocket } = require('./services/socket.service');
initializeSocket(io);

// ── SECURITY MIDDLEWARE ─────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(hpp());

// ── CORS ────────────────────────────────────────────────
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://taskflowtms.sytes.net',
    'http://taskflowtms.sytes.net:3000',
    'https://taskflowtms.sytes.net',
    process.env.CLIENT_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ── BODY PARSER ─────────────────
app.use(express.json({ limit: '10kb' }));

// ── STATIC FILES ────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── SWAGGER DOCUMENTATION ───────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ── ROUTES ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects', projectRoutes);

// ── HEALTH CHECK ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'TMS Server is running!' });
});

// ── 404 HANDLER ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    errorCode: 404,
    message: 'Route not found.',
    description: req.originalUrl + ' does not exist.'
  });
});

// ── GLOBAL ERROR HANDLER ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    errorCode: err.status || 500,
    message: err.message || 'Internal Server Error',
    description: 'An unexpected error occurred.'
  });
});

// ── START SERVER ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });



module.exports = { io };