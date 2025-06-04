import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';

/**
 * MongoDB Service
 *
 * Service for MongoDB connection management using native MongoDB driver.
 * Follows the same patterns as the PostgreSQL DrizzleService for consistency.
 */
@Injectable()
export class MongodbService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private database: Db;

  constructor(
    @Inject('MONGODB_CLIENT') private readonly injectedClient: MongoClient,
    @Inject('DATABASE_NAME') private readonly databaseName: string,
  ) {
    this.client = injectedClient;
  }

  /**
   * Initialize the MongoDB connection when the module is initialized
   */
  async onModuleInit() {
    // Connect to MongoDB
    await this.client.connect();
    this.database = this.client.db(this.databaseName);

    console.log(`MongoDB connected to ${this.databaseName}`);
  }

  /**
   * Close the MongoDB connection when the module is destroyed
   */
  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      console.log(`MongoDB disconnected from ${this.databaseName}`);
    }
  }

  /**
   * Get the MongoDB database instance
   */
  get db(): Db {
    if (!this.database) {
      throw new Error(
        `Database connection not initialized for ${this.databaseName}`,
      );
    }
    return this.database;
  }

  /**
   * Get a specific collection
   * @param collectionName - The name of the collection
   * @returns The MongoDB collection
   */
  getCollection(collectionName: string): Collection {
    return this.db.collection(collectionName);
  }

  /**
   * Get the database name
   */
  get dbName(): string {
    return this.databaseName;
  }

  /**
   * Get the MongoDB client
   */
  get mongoClient(): MongoClient {
    return this.client;
  }

  /**
   * Check MongoDB connectivity
   * @returns Object with status and details
   */
  async checkConnection(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    try {
      const startTime = Date.now();

      // Execute a simple ping command to check connectivity
      const result = await this.db.admin().ping();
      const responseTime = Date.now() - startTime;

      if (result.ok === 1) {
        return {
          status: 'ok',
          details: {
            responseTime,
            connection: 'established',
            database: this.databaseName,
            serverStatus: 'connected',
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
          serverStatus: 'disconnected',
        },
      };
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    databaseName: string;
    isConnected: boolean;
    clientInfo?: string;
  } {
    return {
      databaseName: this.databaseName,
      isConnected: !!this.database,
      clientInfo: this.client ? 'MongoDB Native Driver' : 'Not connected',
    };
  }

  /**
   * Create indexes for a collection
   * @param collectionName - The collection name
   * @param indexes - Array of index specifications
   */
  async createIndexes(
    collectionName: string,
    indexes: Record<string, 1 | -1>[],
  ): Promise<void> {
    const collection = this.getCollection(collectionName);

    for (const index of indexes) {
      try {
        await collection.createIndex(index);
        console.log(`Index created for ${collectionName}:`, index);
      } catch (error) {
        console.warn(`Failed to create index for ${collectionName}:`, error);
      }
    }
  }

  /**
   * Initialize database indexes
   */
  async initializeIndexes(): Promise<void> {
    // This will be called during module initialization to set up indexes
    // Implementation will be added when we create specific repositories
  }
}
