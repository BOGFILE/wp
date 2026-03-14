import mysql from 'mysql2/promise';

/**
 * @fileOverview Database Connection Manager
 * Creates a connection pool for efficient database operations on AWS EC2.
 * HARDCODED CREDENTIALS: Used to bypass environment variable parsing issues 
 * with special characters like '#' in passwords.
 */

// These values are taken directly from your wp-config.php to ensure 100% compatibility
const DB_CONFIG = {
  host: '127.0.0.1', // Using IP instead of 'localhost' to force TCP connection
  user: 'root',
  password: 'AKIAW53#W3aab75FM5BFLQ2!J',
  database: 'prominencebank',
};

const pool = mysql.createPool({
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query(sql: string, params: any[] = []) {
  try {
    // Attempt to get a connection and execute
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error: any) {
    // Log helpful debugging info without exposing the full password
    console.error('--- Database Connection Error ---');
    console.error('Error Code:', error.code);
    console.error('Message:', error.message);
    console.error('User Attempted:', DB_CONFIG.user);
    console.error('Host Attempted:', DB_CONFIG.host);
    console.error('DB Name:', DB_CONFIG.database);
    console.error('---------------------------------');
    throw error;
  }
}
