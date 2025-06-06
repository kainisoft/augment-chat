import { Module } from '@nestjs/common';
import { LoggingModule } from '@app/logging';
import { ChatDatabaseModule } from '../../database/chat-database.module';

// Import repository implementations
import { MongoMessageRepository } from './mongo-message.repository';
import { MongoMessageReadRepository } from './mongo-message-read.repository';
import { MongoConversationRepository } from './mongo-conversation.repository';
import { MongoConversationReadRepository } from './mongo-conversation-read.repository';

/**
 * Repository Module
 *
 * Module for repository implementations in the Chat Service.
 */
@Module({
  imports: [LoggingModule, ChatDatabaseModule],
  providers: [
    // Message repositories
    {
      provide: 'MessageRepository',
      useClass: MongoMessageRepository,
    },
    {
      provide: 'MessageReadRepository',
      useClass: MongoMessageReadRepository,
    },
    // Conversation repositories
    {
      provide: 'ConversationRepository',
      useClass: MongoConversationRepository,
    },
    {
      provide: 'ConversationReadRepository',
      useClass: MongoConversationReadRepository,
    },
  ],
  exports: [
    'MessageRepository',
    'MessageReadRepository',
    'ConversationRepository',
    'ConversationReadRepository',
  ],
})
export class RepositoryModule {}
