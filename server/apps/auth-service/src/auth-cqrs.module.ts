import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Import handlers
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';

@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
  exports: [CqrsModule],
})
export class AuthCqrsModule {}
