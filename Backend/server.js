require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const sequelize = require('./config/database');
require('./models/index');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);

// Test route — confirms server is running
app.get('/', (req, res) => {
  res.json({ message: 'TMS Server is running!' });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });