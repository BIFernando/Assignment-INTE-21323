require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const http      = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
require('./models/index');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');  
const notificationRoutes = require('./routes/notification.routes');// moved up for clarity

const app = express();
const server = http.createServer(app);
 
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);
//Intialize socket handling
const { initializeSocket } = require('./services/socket.service');
initializeSocket(io);

// Security middleware
app.use(helmet());

// Allow requests from your frontend
app.use(cors());

<<<<<<< Updated upstream
// Parse incoming JSON request bodies
app.use(express.json());
=======
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(hpp());
>>>>>>> Stashed changes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/notifications', notificationRoutes);


// ---------- ERROR HANDLERS (must be after all routes) ----------

// 404 handler for routes that do not exist
app.use((req, res) => {
  res.status(404).json({
    errorCode: 404,
    message: 'Route not found.',
    description: req.originalUrl + ' does not exist on this server.'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle Multer file errors specifically
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

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    server.listen(PORT, () => {
<<<<<<< Updated upstream
      console.log('Server is running on port ' + PORT);
=======
      console.log('Server running on port ' + PORT);
      console.log('Security: Helmet, CORS, HPP, Morgan active');
>>>>>>> Stashed changes
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
<<<<<<< Updated upstream
  module.exports = { io };
=======

module.exports = { io };
>>>>>>> Stashed changes
