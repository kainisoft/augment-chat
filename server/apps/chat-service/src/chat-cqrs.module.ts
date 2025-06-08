import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { RedisModule } from '@app/redis';
import { ChatDatabaseModule } from './database/chat-database.module';
import { KafkaProducerModule } from './kafka/kafka-producer.module';
import { ChatGraphQLModule } from './graphql/graphql.module';

// Import handlers (will be created)
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';
import { RepositoryModule } from './infrastructure/repositories/repository.module';
import { PresenceTrackingService } from './domain/services/presence-tracking.service';

/**
 * Chat CQRS Module
 *
 * Module for CQRS pattern implementation in the Chat Service.
 */
@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    RedisModule,
    ChatDatabaseModule,
    RepositoryModule,
    KafkaProducerModule,
    forwardRef(() => ChatGraphQLModule),
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    PresenceTrackingService,
  ],
  exports: [CqrsModule],
})
export class ChatCqrsModule {}
