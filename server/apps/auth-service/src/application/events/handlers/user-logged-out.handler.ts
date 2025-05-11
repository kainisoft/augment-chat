import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';

import { UserLoggedOutEvent } from '../impl/user-logged-out.event';

/**
 * User Logged Out Event Handler
 *
 * Handles side effects when a user logs out
 */
@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutHandler implements IEventHandler<UserLoggedOutEvent> {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(UserLoggedOutHandler.name);
  }

  async handle(event: UserLoggedOutEvent): Promise<void> {
    this.loggingService.log(`User logged out`, 'handle', {
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: event.timestamp,
    });

    // Additional side effects like updating user status, etc.
    // would be implemented here
  }
}
