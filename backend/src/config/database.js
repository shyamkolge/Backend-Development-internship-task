const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger');

// Support both Supabase connection string and individual parameters
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false }, // Required for Supabase
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'auth_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', {
    message: err.message,
    stack: err.stack,
  });
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed', {
      message: err.message,
      stack: err.stack,
    });
  } else {
    logger.info('Database connected successfully', {
      serverTime: res.rows[0],
    });
  }
});

module.exports = pool;
