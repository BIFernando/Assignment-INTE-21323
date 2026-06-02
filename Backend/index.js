require('dotenv').config();
    const express   = require('express');
    const cors      = require('cors');
    const helmet    = require('helmet');
    const sequelize = require('./config/database');
    require('./models/index');
 
    const authRoutes = require('./routes/auth.routes');
    const userRoutes = require('./routes/user.routes');
 
    const app = express();
 
    // Security middleware
    app.use(helmet());
 
    // Allow requests from your frontend
    app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true
    }));
 
    // Parse incoming JSON request bodies
    app.use(express.json());
 
    // Routes
    app.use('/api/auth',  authRoutes);
    app.use('/api/users', userRoutes);
 
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