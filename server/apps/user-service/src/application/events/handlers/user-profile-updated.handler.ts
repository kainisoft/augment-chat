import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserProfileUpdatedEvent } from '../../../domain/events/user-profile-updated.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Profile Updated Event Handler
 *
 * Handles the UserProfileUpdatedEvent and publishes it to Kafka.
 */
@Injectable()
@EventsHandler(UserProfileUpdatedEvent)
export class UserProfileUpdatedHandler
  implements IEventHandler<UserProfileUpdatedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserProfileUpdatedHandler.name);
  }

  async handle(event: UserProfileUpdatedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserProfileUpdatedEvent: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          updatedFields: event.updatedFields,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'user-events',
        {
          type: 'UserProfileUpdated',
          userId: event.userId,
          updatedFields: event.updatedFields,
          timestamp: event.timestamp,
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserProfileUpdatedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserProfileUpdatedEvent to Kafka',
        {
          source: UserProfileUpdatedHandler.name,
          method: 'handle',
          userId: event.userId,
          updatedFields: event.updatedFields,
        },
      );
    }
  }
}
