import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { createSchema } from './create-schema';
import * as path from 'path';

dotenv.config();

/**
 * Run database migrations
 */
const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL ||
    `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'postgres'}`;

  // First ensure the schema exists
  await createSchema();

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('Running migrations...');

  try {
    // Get the migrations directory path
    const migrationsFolder = path.join(__dirname, '..', '..', 'migrations');
    
    // Run the migrations
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed', err);
      process.exit(1);
    });
}

export { runMigration };
