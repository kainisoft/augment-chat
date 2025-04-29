import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { DatabaseService } from './database.service';

/**
 * Database Module
 *
 * Main module for database integration.
 */
@Module({
  imports: [ConfigModule, DrizzleModule],
  providers: [DatabaseService],
  exports: [DrizzleModule, DatabaseService],
})
export class DatabaseModule {}
