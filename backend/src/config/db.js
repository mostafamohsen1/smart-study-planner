const sql = require('mssql');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// SQL Server configuration
const config = {
  server: process.env.SQL_SERVER || 'localhost',
  database: process.env.SQL_DATABASE || 'SmartStudyPlanner',
  user: process.env.SQL_USER || 'sa',
  password: process.env.SQL_PASSWORD,
  port: parseInt(process.env.SQL_PORT || '1433'),
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true', // Use encryption if specified
    trustServerCertificate: true, // For development only
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create a pool of connections
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server...');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed!', err);
    process.exit(1);
  });

// Export the pool and sql for use throughout the application
module.exports = {
  sql,
  poolPromise
}; 