import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { ChatDatabaseModule } from './database/chat-database.module';
import { KafkaProducerModule } from './kafka/kafka-producer.module';

// Import handlers (will be created)
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';
import { RepositoryModule } from './infrastructure/repositories/repository.module';

/**
 * Chat CQRS Module
 *
 * Module for CQRS pattern implementation in the Chat Service.
 */
@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    ChatDatabaseModule,
    RepositoryModule,
    KafkaProducerModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
  exports: [CqrsModule],
})
export class ChatCqrsModule {}
