import { Injectable } from '@nestjs/common';
import { DrizzleService } from './drizzle/drizzle.service';

/**
 * Database Service
 *
 * Main service for database operations.
 * This service provides a convenient way to access the database
 * and can be extended with additional functionality.
 */
@Injectable()
export class DatabaseService {
  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * Get the Drizzle service
   */
  get drizzle(): DrizzleService {
    return this.drizzleService;
  }
}
