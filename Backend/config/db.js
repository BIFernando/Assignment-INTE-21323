const mysql2 = require('mysql2');
require('dotenv').config();

const pool = mysql2.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'tms_db',
  port: 3308,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Database connected successfully!');
  connection.release();
});

module.exports = pool.promise();