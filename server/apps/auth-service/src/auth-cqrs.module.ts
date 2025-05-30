import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { DatabaseModule } from '@app/database';

// Import handlers
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';
import { RepositoryModule } from './infrastructure/repositories/repository.module';
import { CacheModule } from './cache/cache.module';
import { KafkaProducerModule } from './kafka/kafka-producer.module';
import { JwtModule } from './infrastructure/jwt/jwt.module';
import { TokenModule } from './token/token.module';
import { SessionModule } from './session/session.module';
import { AccountLockoutModule } from './domain/services/account-lockout.module';

/**
 * Auth CQRS Module
 *
 * Module for CQRS pattern implementation in the Auth Service.
 */
@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    DatabaseModule.forAuth(),
    RepositoryModule,
    CacheModule,
    KafkaProducerModule,
    JwtModule,
    TokenModule,
    SessionModule,
    AccountLockoutModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
  exports: [CqrsModule],
})
export class AuthCqrsModule {}
