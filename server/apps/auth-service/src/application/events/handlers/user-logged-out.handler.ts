import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SecurityLoggingService } from '../../../security-logging/security-logging.service';
import { SecurityEventType } from '../../../security-logging/interfaces/security-event.interface';
import { UserLoggedOutEvent } from '../impl/user-logged-out.event';

/**
 * User Logged Out Event Handler
 *
 * Handles side effects when a user logs out
 */
@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutHandler implements IEventHandler<UserLoggedOutEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly securityLoggingService: SecurityLoggingService,
  ) {
    this.loggingService.setContext(UserLoggedOutHandler.name);
  }

  async handle(event: UserLoggedOutEvent): Promise<void> {
    try {
      // Standard logging
      this.loggingService.log(`User logged out`, 'handle', {
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
      });

      // Security logging
      await this.securityLoggingService.logAuthenticationEvent(
        SecurityEventType.LOGOUT,
        {
          userId: event.userId,
          sessionId: event.sessionId,
          success: true,
        },
      );

      // Additional side effects like updating user status, etc.
      // would be implemented here
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Error handling user logout event', {
        source: UserLoggedOutHandler.name,
        method: 'handle',
        userId: event.userId,
        sessionId: event.sessionId,
      });
    }
  }
}
