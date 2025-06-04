import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
      imports: [
        ConfigModule,
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: () => {
            const connectionString = process.env.MONGODB_URI;

            return {
              uri: connectionString,
              connectionFactory: (connection) => {
                connection.on('connected', () => {
                  console.log(`MongoDB connected to ${connectionString}`);
                });
                connection.on('disconnected', () => {
                  console.log(`MongoDB disconnected from ${databaseName}`);
                });
                connection.on('error', (error) => {
                  console.error(
                    `MongoDB connection error for ${databaseName}:`,
                    error,
                  );
                });
                return connection;
              },
            };
          },
        }),
      ],
      providers: [
        {
          provide: 'DATABASE_NAME',
          useValue: databaseName,
        },
        MongodbService,
      ],
      exports: [MongooseModule, MongodbService],
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
