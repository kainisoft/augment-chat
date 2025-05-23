import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { PasswordChangedEvent } from '../impl/password-changed.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * Password Changed Event Handler
 *
 * Handles side effects when a user's password is changed
 * and publishes the event to Kafka
 */
@EventsHandler(PasswordChangedEvent)
export class PasswordChangedHandler
  implements IEventHandler<PasswordChangedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(PasswordChangedHandler.name);
  }

  async handle(event: PasswordChangedEvent): Promise<void> {
    try {
      this.loggingService.log(`Password changed for user`, 'handle', {
        userId: event.userId,
        timestamp: event.timestamp,
      });

      // Additional side effects like sending password change notification email, etc.
      // would be implemented here

      // Publish event to Kafka
      this.loggingService.debug(
        `Publishing PasswordChangedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
        },
      );

      await this.kafkaProducerService.send('auth-events', event, event.userId);

      this.loggingService.debug(
        `Published PasswordChangedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle PasswordChangedEvent',
        {
          source: PasswordChangedHandler.name,
          method: 'handle',
          userId: event.userId,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}
