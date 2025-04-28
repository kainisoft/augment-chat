import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class NotificationSeedService {
  private readonly logger = new Logger(NotificationSeedService.name);

  constructor(
    @InjectConnection('notification')
    private readonly connection: Connection,
  ) {}

  /**
   * Seed the notification database with test data
   */
  async seed(): Promise<void> {
    this.logger.log('Seeding notification database...');
    
    // Example seed data for notifications collection
    const notificationsCollection = this.connection.collection('notifications');
    await notificationsCollection.insertMany([
      {
        user_id: '1',
        type: 'message',
        content: 'You have a new message',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: '2',
        type: 'friend_request',
        content: 'You have a new friend request',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { ordered: false });
    
    this.logger.log('Notification database seeded successfully');
  }

  /**
   * Clear seeded test data from the notification database
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing notification database...');
    
    // Clear test data
    const notificationsCollection = this.connection.collection('notifications');
    await notificationsCollection.deleteMany({
      user_id: { $in: ['1', '2'] },
    });
    
    this.logger.log('Notification database cleared successfully');
  }
}
