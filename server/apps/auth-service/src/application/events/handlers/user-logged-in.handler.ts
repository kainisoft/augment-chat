import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserLoggedInEvent } from '../impl/user-logged-in.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Logged In Event Handler
 *
 * Handles side effects when a user logs in
 * and publishes the event to Kafka
 */
@EventsHandler(UserLoggedInEvent)
export class UserLoggedInHandler implements IEventHandler<UserLoggedInEvent> {
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserLoggedInHandler.name);
  }

  async handle(event: UserLoggedInEvent): Promise<void> {
    try {
      this.loggingService.log(`User logged in: ${event.email}`, 'handle', {
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        timestamp: event.timestamp,
      });

      // Additional side effects like updating user activity, etc.
      // would be implemented here

      // Simulate an async operation
      await Promise.resolve();

      // Publish event to Kafka
      this.loggingService.debug(
        `Publishing UserLoggedInEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          email: event.email,
        },
      );

      await this.kafkaProducerService.send('auth-events', event, event.userId);

      this.loggingService.debug(
        `Published UserLoggedInEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error handling user login event',
        {
          source: UserLoggedInHandler.name,
          method: 'handle',
          userId: event.userId,
          email: event.email,
          ip: event.ip,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}
