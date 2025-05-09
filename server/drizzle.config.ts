import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Determine which service to target based on environment variable
const SERVICE = process.env.SERVICE || 'auth';

// Configuration map for different services
const serviceConfigs = {
  auth: {
    schema: './libs/database/src/schemas/auth/*.ts',
    out: './libs/database/migrations/auth',
    dbName: process.env.AUTH_DB || 'auth_db',
    schemaFilter: ['auth'],
  },
  user: {
    schema: './libs/database/src/schemas/user/*.ts',
    out: './libs/database/migrations/user',
    dbName: process.env.USER_DB || 'user_db',
    schemaFilter: ['users'],
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
 * Drizzle Kit Configuration
 *
 * This configuration supports multiple databases for different microservices.
 * Use the SERVICE environment variable to specify which service to target.
 * Example: SERVICE=auth drizzle-kit generate:pg
 */
export default defineConfig({
  schema: currentConfig.schema,
  out: currentConfig.out,
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: currentConfig.dbName,
  },
  schemaFilter: currentConfig.schemaFilter,
});
