import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Determine which service to target based on environment variable
const SERVICE = process.env.SERVICE || 'auth';

// Configuration map for different services
const serviceConfigs = {
  auth: {
    dbName: process.env.AUTH_DB || 'auth_db',
    schema: 'auth',
  },
  user: {
    dbName: process.env.USER_DB || 'user_db',
    schema: 'users',
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
 * Create the PostgreSQL schema for the specified service
 */
const createSchema = async () => {
  // Create connection pool
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: currentConfig.dbName,
    max: process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE) : 10,
    idleTimeoutMillis: process.env.DATABASE_IDLE_TIMEOUT ? parseInt(process.env.DATABASE_IDLE_TIMEOUT) * 1000 : 30000,
  });

  console.log(
    `Creating ${SERVICE} PostgreSQL schema (${currentConfig.schema})...`,
  );

  try {
    // Create schema if it doesn't exist
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${currentConfig.schema};`);
    console.log(`${SERVICE} PostgreSQL schema created successfully`);
  } catch (error) {
    console.error(`${SERVICE} schema creation failed`, error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the schema creation if this file is executed directly
if (require.main === module) {
  createSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(
        `Unexpected error during schema creation for ${SERVICE}`,
        err,
      );
      process.exit(1);
    });
}

export { createSchema };
