import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { DatabaseModule } from '@app/database';

// Import handlers
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { RepositoryModule } from './infrastructure/repositories/repository.module';
import { CacheModule } from './cache/cache.module';

/**
 * User CQRS Module
 *
 * Module for CQRS pattern implementation in the User Service.
 */
@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    DatabaseModule.forUser(),
    RepositoryModule,
    CacheModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [CqrsModule],
})
export class UserCqrsModule {}
