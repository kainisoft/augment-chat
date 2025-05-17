import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SecurityLoggingService } from '../../../security-logging/security-logging.service';
import { SecurityEventType } from '../../../security-logging/interfaces/security-event.interface';
import { SessionTerminatedEvent } from '../impl';

/**
 * Session Terminated Event Handler
 *
 * Handles events when a session is terminated
 */
@EventsHandler(SessionTerminatedEvent)
export class SessionTerminatedHandler
  implements IEventHandler<SessionTerminatedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly securityLoggingService: SecurityLoggingService,
  ) {
    this.loggingService.setContext(SessionTerminatedHandler.name);
  }

  async handle(event: SessionTerminatedEvent): Promise<void> {
    try {
      // Standard logging
      this.loggingService.debug(
        `Session ${event.sessionId} terminated for user ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
        },
      );

      // Security logging
      await this.securityLoggingService.logSessionEvent(
        SecurityEventType.SESSION_TERMINATED,
        {
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
          timestamp: Date.now(),
        },
      );

      // Additional logic for session termination could be added here
      // For example, sending notifications, etc.
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error,
        'Error handling session termination event',
        {
          source: SessionTerminatedHandler.name,
          method: 'handle',
          userId: event.userId,
          sessionId: event.sessionId,
        },
      );
    }
  }
}
