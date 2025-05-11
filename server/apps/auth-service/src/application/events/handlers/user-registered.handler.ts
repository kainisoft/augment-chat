import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';

import { UserRegisteredEvent } from '../impl/user-registered.event';

/**
 * User Registered Event Handler
 *
 * Handles side effects when a user is registered
 */
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(UserRegisteredHandler.name);
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.loggingService.info(`User registered: ${event.email}`, 'handle', {
      userId: event.userId,
      timestamp: event.timestamp,
    });

    // Additional side effects like sending welcome email, etc.
    // would be implemented here
  }
}
