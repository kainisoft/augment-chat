import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../schemas';

/**
 * Drizzle Service
 *
 * Service for interacting with the database using Drizzle ORM.
 */
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private _db: NodePgDatabase<typeof schema>;
  private _pool: Pool;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the database connection when the module is initialized
   */
  onModuleInit() {
    const connectionString = this.getConnectionString();

    this._pool = new Pool({
      connectionString,
      max: this.configService.get<number>('DATABASE_POOL_SIZE', 10),
      idleTimeoutMillis:
        this.configService.get<number>('DATABASE_IDLE_TIMEOUT', 30) * 1000,
    });

    this._db = drizzle({ client: this._pool, schema });
  }

  /**
   * Close the database connection when the module is destroyed
   */
  async onModuleDestroy() {
    if (this._pool) {
      await this._pool.end();
    }
  }

  /**
   * Get the database connection
   */
  get db(): NodePgDatabase<typeof schema> {
    return this._db;
  }

  /**
   * Get the SQL tag function for raw SQL queries
   */
  get sql() {
    return sql;
  }

  /**
   * Get the database connection string
   * @returns The connection string
   */
  private getConnectionString(): string {
    return (
      this.configService.get<string>('DATABASE_URL') ||
      `postgres://${this.configService.get<string>('POSTGRES_USER', 'postgres')}:${this.configService.get<string>(
        'POSTGRES_PASSWORD',
        'postgres',
      )}@${this.configService.get<string>('POSTGRES_HOST', 'localhost')}:${this.configService.get<string>(
        'POSTGRES_PORT',
        '5432',
      )}/${this.configService.get<string>('POSTGRES_DB', 'postgres')}`
    );
  }
}
