import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { MongodbService } from './mongodb.service';

/**
 * MongoDB Module
 *
 * Main module for MongoDB integration following the established patterns
 * from the PostgreSQL database module. This module provides MongoDB
 * connectivity for microservices that require document storage.
 */
@Module({})
export class MongodbModule {
  /**
   * Register the MongoDB module for a specific database
   *
   * @param databaseName The name of the MongoDB database to connect to
   * @returns A dynamic module configuration
   */
  static forRoot(databaseName: string): DynamicModule {
    return {
      module: MongodbModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MONGODB_CLIENT',
          useFactory: () => {
            // Use localhost for local development, mongo for Docker
            const mongoHost = process.env.MONGODB_HOST || 'localhost';
            const mongoPort = process.env.MONGODB_PORT || '27017';
            const mongoUser = process.env.MONGODB_USER || 'mongo';
            const mongoPassword = process.env.MONGODB_PASSWORD || 'mongo';

            const connectionString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}?authSource=admin`;

            console.log(
              `Creating MongoDB client for ${databaseName} at ${mongoHost}:${mongoPort}`,
            );

            return new MongoClient(connectionString, {
              maxPoolSize: 10,
              serverSelectionTimeoutMS: 5000,
              socketTimeoutMS: 45000,
            });
          },
        },
        {
          provide: 'DATABASE_NAME',
          useValue: databaseName,
        },
        MongodbService,
      ],
      exports: [MongodbService],
    };
  }

  /**
   * Register the MongoDB module for the Chat Service
   *
   * @returns A dynamic module configuration for the Chat Service
   */
  static forChat(): DynamicModule {
    return this.forRoot('chat_db');
  }

  /**
   * Register the MongoDB module for the Notification Service
   *
   * @returns A dynamic module configuration for the Notification Service
   */
  static forNotification(): DynamicModule {
    return this.forRoot('notification_db');
  }
}
