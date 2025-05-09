import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService, DatabaseType } from './drizzle.service';

/**
 * Drizzle Module
 *
 * Module for Drizzle ORM integration with NestJS.
 * This module is dynamic and can be registered for different database types.
 */
@Module({})
export class DrizzleModule {
  /**
   * Register the Drizzle module for a specific database type
   *
   * @param databaseType The type of database to connect to
   * @returns A dynamic module configuration
   */
  static forRoot(databaseType: DatabaseType): DynamicModule {
    return {
      module: DrizzleModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'DATABASE_TYPE',
          useValue: databaseType,
        },
        DrizzleService,
      ],
      exports: [DrizzleService],
    };
  }

  /**
   * Register the Drizzle module for the Auth Service
   *
   * @returns A dynamic module configuration for the Auth Service
   */
  static forAuth(): DynamicModule {
    return this.forRoot(DatabaseType.AUTH);
  }

  /**
   * Register the Drizzle module for the User Service
   *
   * @returns A dynamic module configuration for the User Service
   */
  static forUser(): DynamicModule {
    return this.forRoot(DatabaseType.USER);
  }
}
