const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ceo_dashboard',
  user: process.env.DB_USER || 'dashboard_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function connectDB() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}

async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => {
    client.release();
  };
  
  return { query, release };
}

module.exports = {
  query,
  getClient,
  connectDB,
  pool
};