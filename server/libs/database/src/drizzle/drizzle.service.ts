import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schemas';
import { sql } from 'drizzle-orm';

/**
 * Drizzle Service
 * 
 * Service for interacting with the database using Drizzle ORM.
 */
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private _db: PostgresJsDatabase<typeof schema>;
  private _client: postgres.Sql<{}>;
  
  constructor(private readonly configService: ConfigService) {}
  
  /**
   * Initialize the database connection when the module is initialized
   */
  async onModuleInit() {
    const connectionString = this.getConnectionString();
    
    // Create the Postgres client
    this._client = postgres(connectionString, {
      max: this.configService.get<number>('DATABASE_POOL_SIZE', 10),
      idle_timeout: this.configService.get<number>('DATABASE_IDLE_TIMEOUT', 30),
    });
    
    // Create the Drizzle instance
    this._db = drizzle(this._client, { schema });
  }
  
  /**
   * Close the database connection when the module is destroyed
   */
  async onModuleDestroy() {
    if (this._client) {
      await this._client.end();
    }
  }
  
  /**
   * Get the database connection
   */
  get db(): PostgresJsDatabase<typeof schema> {
    return this._db;
  }
  
  /**
   * Get the SQL tag for raw SQL queries
   */
  get sql() {
    return sql;
  }
  
  /**
   * Get the database connection string
   * @returns The connection string
   */
  private getConnectionString(): string {
    return this.configService.get<string>('DATABASE_URL') ||
      `postgres://${this.configService.get<string>('POSTGRES_USER', 'postgres')}:${
        this.configService.get<string>('POSTGRES_PASSWORD', 'postgres')
      }@${this.configService.get<string>('POSTGRES_HOST', 'localhost')}:${
        this.configService.get<string>('POSTGRES_PORT', '5432')
      }/${this.configService.get<string>('POSTGRES_DB', 'postgres')}`;
  }
}
