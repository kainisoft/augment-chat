import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';
import { AllSessionsTerminatedEvent } from '../impl';

/**
 * All Sessions Terminated Event Handler
 *
 * Handles events when all sessions for a user are terminated
 */
@EventsHandler(AllSessionsTerminatedEvent)
export class AllSessionsTerminatedHandler
  implements IEventHandler<AllSessionsTerminatedEvent>
{
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(AllSessionsTerminatedHandler.name);
  }

  async handle(event: AllSessionsTerminatedEvent): Promise<void> {
    this.loggingService.debug(
      `Terminated ${event.terminatedCount} sessions for user ${event.userId}`,
      'handle',
      {
        userId: event.userId,
        currentSessionId: event.currentSessionId,
        terminatedCount: event.terminatedCount,
      },
    );

    // Additional logic for session termination could be added here
    // For example, sending notifications, updating security logs, etc.
  }
}
