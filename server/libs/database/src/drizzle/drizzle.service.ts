import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../schemas';

/**
 * Database Type
 *
 * Enum representing the different database types in the application.
 */
export enum DatabaseType {
  AUTH = 'auth',
  USER = 'user',
}

/**
 * Drizzle Service
 *
 * Service for interacting with multiple databases using Drizzle ORM.
 * Each microservice has its own database connection.
 */
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private _pools: Map<DatabaseType, Pool> = new Map();
  private _dbs: Map<DatabaseType, NodePgDatabase<any>> = new Map();
  private _currentDbType: DatabaseType;

  constructor(
    private readonly configService: ConfigService,
    @Inject('DATABASE_TYPE') databaseType: DatabaseType,
  ) {
    this._currentDbType = databaseType;
  }

  /**
   * Initialize the database connections when the module is initialized
   */
  onModuleInit() {
    // Initialize the database connection for the current service
    this.initializeDatabase(this._currentDbType);
  }

  /**
   * Initialize a database connection for a specific database type
   */
  private initializeDatabase(dbType: DatabaseType) {
    const connectionString = this.getConnectionString(dbType);

    const pool = new Pool({
      connectionString,
      max: this.configService.get<number>('DATABASE_POOL_SIZE', 10),
      idleTimeoutMillis:
        this.configService.get<number>('DATABASE_IDLE_TIMEOUT', 30) * 1000,
    });

    let db: NodePgDatabase<any>;

    // Initialize the appropriate schema based on database type
    switch (dbType) {
      case DatabaseType.AUTH:
        db = drizzle({ client: pool, schema: schema.auth });
        break;
      case DatabaseType.USER:
        db = drizzle({ client: pool, schema: schema.user });
        break;
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }

    this._pools.set(dbType, pool);
    this._dbs.set(dbType, db);
  }

  /**
   * Close all database connections when the module is destroyed
   */
  async onModuleDestroy() {
    for (const pool of this._pools.values()) {
      await pool.end();
    }
  }

  /**
   * Get the database connection for the current service
   */
  get db(): NodePgDatabase<any> {
    const db = this._dbs.get(this._currentDbType);

    if (!db) {
      throw new Error(
        `Database connection not initialized for ${this._currentDbType}`,
      );
    }

    return db;
  }

  /**
   * Get the SQL tag function for raw SQL queries
   */
  get sql() {
    return sql;
  }

  /**
   * Get the database connection string for a specific database type
   */
  private getConnectionString(dbType: DatabaseType): string {
    // Default database name based on database type
    const defaultDbName = `${dbType}_db`;

    // Environment variable name for the database URL based on database type
    const dbUrlEnvVar = `${dbType.toUpperCase()}_DATABASE_URL`;

    return (
      this.configService.get<string>(dbUrlEnvVar) ||
      `postgres://${this.configService.get<string>('POSTGRES_USER', 'postgres')}:${this.configService.get<string>(
        'POSTGRES_PASSWORD',
        'postgres',
      )}@${this.configService.get<string>('POSTGRES_HOST', 'localhost')}:${this.configService.get<string>(
        'POSTGRES_PORT',
        '5432',
      )}/${this.configService.get<string>(`${dbType.toUpperCase()}_DB`, defaultDbName)}`
    );
  }
}
