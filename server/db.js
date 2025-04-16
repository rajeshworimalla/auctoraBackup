require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db.YOUR-SUPABASE-HOST.supabase.co',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'your-db-password',
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false, // required for Supabase SSL
  },
});

module.exports = pool;
