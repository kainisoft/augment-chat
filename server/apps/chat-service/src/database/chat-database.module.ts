import { Module } from '@nestjs/common';
import { MongodbModule } from '@app/mongodb';
import { ChatDatabaseService } from './chat-database.service';

/**
 * Chat Database Module
 *
 * Module for MongoDB integration in the Chat Service.
 * Follows the same patterns as UserDatabaseModule for consistency.
 */
@Module({
  imports: [MongodbModule.forChat()],
  providers: [ChatDatabaseService],
  exports: [ChatDatabaseService],
})
export class ChatDatabaseModule {}
