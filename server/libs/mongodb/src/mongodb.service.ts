import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * MongoDB Service
 *
 * Service for MongoDB connection management and health checks.
 * Follows the same patterns as the PostgreSQL DrizzleService.
 */
@Injectable()
export class MongodbService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject('DATABASE_NAME') private readonly databaseName: string,
  ) {}

  /**
   * Initialize the MongoDB connection when the module is initialized
   */
  async onModuleInit() {
    // Connection is automatically handled by Mongoose
    // This is here for consistency with the DrizzleService pattern
  }

  /**
   * Close the MongoDB connection when the module is destroyed
   */
  async onModuleDestroy() {
    if (this.connection.readyState === 1) {
      await this.connection.close();
    }
  }

  /**
   * Get the MongoDB connection
   */
  get db(): Connection {
    return this.connection;
  }

  /**
   * Get the database name
   */
  get dbName(): string {
    return this.databaseName;
  }

  /**
   * Check MongoDB connectivity
   * @returns Object with status and details
   */
  async checkConnection(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    try {
      const startTime = Date.now();

      // Execute a simple ping command to check connectivity
      const db = this.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.admin().ping();
      const responseTime = Date.now() - startTime;

      if (result.ok === 1) {
        return {
          status: 'ok',
          details: {
            responseTime,
            connection: 'established',
            database: this.databaseName,
            readyState: this.connection.readyState,
          },
        };
      } else {
        throw new Error('MongoDB ping failed');
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'error',
        details: {
          message: errorMessage,
          database: this.databaseName,
          readyState: this.connection.readyState,
        },
      };
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    readyState: number;
    host: string;
    port: number;
    name: string;
  } {
    return {
      readyState: this.connection.readyState,
      host: this.connection.host,
      port: this.connection.port,
      name: this.connection.name,
    };
  }
}
