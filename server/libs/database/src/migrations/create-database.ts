import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Determine which service to target based on environment variable
const SERVICE = process.env.SERVICE || 'auth';

// Configuration map for different services
const serviceConfigs = {
  auth: {
    dbName: process.env.AUTH_DB || 'auth_db',
  },
  user: {
    dbName: process.env.USER_DB || 'user_db',
  },
};

// Get the configuration for the current service
const currentConfig = serviceConfigs[SERVICE];

if (!currentConfig) {
  throw new Error(
    `Invalid service: ${SERVICE}. Valid options are: ${Object.keys(serviceConfigs).join(', ')}`,
  );
}

/**
 * Create the PostgreSQL database for the specified service
 */
const createDatabase = async () => {
  // Connect to the default postgres database to create new databases
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: 'postgres', // Connect to the default postgres database
    max: process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE) : 10,
    idleTimeoutMillis: process.env.DATABASE_IDLE_TIMEOUT ? parseInt(process.env.DATABASE_IDLE_TIMEOUT) * 1000 : 30000,
  });

  console.log(`Checking if ${SERVICE} database (${currentConfig.dbName}) exists...`);

  try {
    // Check if the database exists
    const { rows } = await pool.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [currentConfig.dbName]);

    if (rows.length === 0) {
      console.log(`Creating ${SERVICE} database (${currentConfig.dbName})...`);
      
      // Create the database if it doesn't exist
      // We need to use template literals here because parameterized queries don't work with CREATE DATABASE
      await pool.query(`CREATE DATABASE ${currentConfig.dbName};`);
      
      console.log(`${SERVICE} database created successfully`);
    } else {
      console.log(`${SERVICE} database already exists`);
    }
  } catch (error) {
    console.error(`${SERVICE} database creation failed`, error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the database creation if this file is executed directly
if (require.main === module) {
  createDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(
        `Unexpected error during database creation for ${SERVICE}`,
        err,
      );
      process.exit(1);
    });
}

export { createDatabase };
