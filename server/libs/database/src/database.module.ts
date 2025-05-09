import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { DatabaseType } from './drizzle/drizzle.service';
import { DatabaseService } from './database.service';

/**
 * Database Module
 *
 * Main module for database integration.
 * This module is dynamic and can be registered for different microservices.
 */
@Module({})
export class DatabaseModule {
  /**
   * Register the Database module for a specific database type
   *
   * @param databaseType The type of database to connect to
   * @returns A dynamic module configuration
   */
  static forRoot(databaseType: DatabaseType): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule, DrizzleModule.forRoot(databaseType)],
      providers: [DatabaseService],
      exports: [DrizzleModule, DatabaseService],
    };
  }

  /**
   * Register the Database module for the Auth Service
   *
   * @returns A dynamic module configuration for the Auth Service
   */
  static forAuth(): DynamicModule {
    return this.forRoot(DatabaseType.AUTH);
  }

  /**
   * Register the Database module for the User Service
   *
   * @returns A dynamic module configuration for the User Service
   */
  static forUser(): DynamicModule {
    return this.forRoot(DatabaseType.USER);
  }
}
