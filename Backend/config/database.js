const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use DB_URL from .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
