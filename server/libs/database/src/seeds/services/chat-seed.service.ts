import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class ChatSeedService {
  private readonly logger = new Logger(ChatSeedService.name);

  constructor(
    @InjectConnection('chat')
    private readonly connection: Connection,
  ) {}

  /**
   * Seed the chat database with test data
   */
  async seed(): Promise<void> {
    this.logger.log('Seeding chat database...');
    
    // Example seed data for conversations collection
    const conversationsCollection = this.connection.collection('conversations');
    await conversationsCollection.insertMany([
      {
        participants: ['1', '2'],
        title: 'Test Conversation',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { ordered: false });
    
    // Example seed data for messages collection
    const messagesCollection = this.connection.collection('messages');
    await messagesCollection.insertMany([
      {
        conversation_id: '1',
        sender_id: '1',
        content: 'Hello, this is a test message',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        conversation_id: '1',
        sender_id: '2',
        content: 'Hi there! This is a reply',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { ordered: false });
    
    this.logger.log('Chat database seeded successfully');
  }

  /**
   * Clear seeded test data from the chat database
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing chat database...');
    
    // Clear test data
    const conversationsCollection = this.connection.collection('conversations');
    await conversationsCollection.deleteMany({
      title: 'Test Conversation',
    });
    
    const messagesCollection = this.connection.collection('messages');
    await messagesCollection.deleteMany({
      conversation_id: '1',
    });
    
    this.logger.log('Chat database cleared successfully');
  }
}
