import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserLoggedOutEvent } from '../impl/user-logged-out.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Logged Out Event Handler
 *
 * Handles side effects when a user logs out
 * and publishes the event to Kafka
 */
@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutHandler implements IEventHandler<UserLoggedOutEvent> {
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserLoggedOutHandler.name);
  }

  async handle(event: UserLoggedOutEvent): Promise<void> {
    try {
      this.loggingService.log(`User logged out`, 'handle', {
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
      });

      // Additional side effects like updating user status, etc.
      // would be implemented here

      // Publish event to Kafka
      this.loggingService.debug(
        `Publishing UserLoggedOutEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          sessionId: event.sessionId,
        },
      );

      await this.kafkaProducerService.send('auth-events', event, event.userId);

      this.loggingService.debug(
        `Published UserLoggedOutEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId, sessionId: event.sessionId },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle UserLoggedOutEvent',
        {
          source: UserLoggedOutHandler.name,
          method: 'handle',
          userId: event.userId,
          sessionId: event.sessionId,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}
