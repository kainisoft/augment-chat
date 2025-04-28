import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserSeedService {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    @InjectDataSource('user')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Seed the user database with test data
   */
  async seed(): Promise<void> {
    this.logger.log('Seeding user database...');
    
    // Example seed data for profiles table
    await this.dataSource.query(`
      INSERT INTO profiles (user_id, first_name, last_name, avatar_url, bio, created_at, updated_at)
      VALUES 
        ('1', 'Admin', 'User', 'https://example.com/avatar1.jpg', 'Admin user bio', NOW(), NOW()),
        ('2', 'Regular', 'User', 'https://example.com/avatar2.jpg', 'Regular user bio', NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING;
    `);
    
    this.logger.log('User database seeded successfully');
  }

  /**
   * Clear seeded test data from the user database
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing user database...');
    
    // Clear test data
    await this.dataSource.query(`
      DELETE FROM profiles 
      WHERE user_id IN ('1', '2');
    `);
    
    this.logger.log('User database cleared successfully');
  }
}
