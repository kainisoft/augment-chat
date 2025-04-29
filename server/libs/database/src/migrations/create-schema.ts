import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Create the PostgreSQL schema
 */
const createSchema = async () => {
  const connectionString = process.env.DATABASE_URL ||
    `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'postgres'}`;

  const sql = postgres(connectionString, { max: 1 });

  console.log('Creating PostgreSQL schema...');

  try {
    // Create schema if it doesn't exist
    await sql`CREATE SCHEMA IF NOT EXISTS chat_app;`;
    console.log('PostgreSQL schema created successfully');
  } catch (error) {
    console.error('Schema creation failed', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

// Run the schema creation if this file is executed directly
if (require.main === module) {
  createSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Schema creation failed', err);
      process.exit(1);
    });
}

export { createSchema };
