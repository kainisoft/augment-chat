import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createDatabase } from './create-database';

dotenv.config();

// Determine which service to target based on environment variable
const SERVICE = process.env.SERVICE || 'auth';

// Configuration map for different services
const serviceConfigs = {
  auth: {
    dbName: process.env.AUTH_DB || 'auth_db',
    migrationsFolder: path.join(__dirname, '..', '..', 'migrations', 'auth'),
    schema: 'auth',
  },
  user: {
    dbName: process.env.USER_DB || 'user_db',
    migrationsFolder: path.join(__dirname, '..', '..', 'migrations', 'user'),
    schema: 'users',
  },
};

// Get the configuration for the current service
const currentConfig = serviceConfigs[SERVICE];

if (!currentConfig) {
  throw new Error(`Invalid service: ${SERVICE}. Valid options are: ${Object.keys(serviceConfigs).join(', ')}`);
}

/**
 * Run migrations for the specified service
 */
const runMigration = async () => {
  // First ensure the database exists
  await createDatabase();

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

  try {
    // First ensure the schema exists
    console.log(`Creating ${SERVICE} PostgreSQL schema (${currentConfig.schema})...`);
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${currentConfig.schema};`);
    console.log(`${SERVICE} PostgreSQL schema created successfully`);

    // Initialize Drizzle with the pool
    const db = drizzle(pool);

    console.log(`Running migrations for ${SERVICE} database...`);

    // Check if any tables exist in the schema
    const { rows } = await pool.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = '${currentConfig.schema}'
    `);

    const tableCount = parseInt(rows[0].table_count);

    if (tableCount > 0) {
      console.log(`${SERVICE} database already has ${tableCount} tables. Creating drizzle_migrations table...`);

      // Create the drizzle_migrations table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${currentConfig.schema}.drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now() NOT NULL
        )
      `);

      console.log(`${SERVICE} database migration tracking table created.`);
    } else {
      // Run the migrations
      await migrate(db, { migrationsFolder: currentConfig.migrationsFolder });
      console.log(`${SERVICE} database migrations completed successfully`);
    }
  } catch (error) {
    console.error(`${SERVICE} database operation failed`, error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
};

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`Unexpected error during migration for ${SERVICE}`, err);
      process.exit(1);
    });
}

export { runMigration };
