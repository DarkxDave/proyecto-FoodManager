const mysql = require('mysql2/promise');
require('dotenv').config();

// Simple configuration. Adjust environment variables in a .env file if desired.
// FALLBACKS: host=127.0.0.1 user=root password="" database=supermercado
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'supermercado',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
