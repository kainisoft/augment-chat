import { Injectable, Logger } from '@nestjs/common';
// TODO: Replace with Drizzle-based seeding
// import { InjectDataSource } from '@nestjs/typeorm';
// import { DataSource } from 'typeorm';

@Injectable()
export class AuthSeedService {
  private readonly logger = new Logger(AuthSeedService.name);

  constructor(
    // TODO: Replace with Drizzle injection
    // @InjectDataSource('auth')
    // private readonly dataSource: DataSource,
  ) {}

  /**
   * Seed the auth database with test data
   */
  async seed(): Promise<void> {
    this.logger.log('Seeding auth database...');

    // TODO: Replace with Drizzle-based seeding
    // Example seed data for users table
    // await this.dataSource.query(`
    //   INSERT INTO users (email, password_hash, role, created_at, updated_at)
    //   VALUES
    //     ('admin@example.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'admin', NOW(), NOW()),
    //     ('user@example.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'user', NOW(), NOW())
    //   ON CONFLICT (email) DO NOTHING;
    // `);

    this.logger.log('Auth database seeded successfully');
  }

  /**
   * Clear seeded test data from the auth database
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing auth database...');

    // TODO: Replace with Drizzle-based clearing
    // Clear test data
    // await this.dataSource.query(`
    //   DELETE FROM users
    //   WHERE email IN ('admin@example.com', 'user@example.com');
    // `);

    this.logger.log('Auth database cleared successfully');
  }
}
