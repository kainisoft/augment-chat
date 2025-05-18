import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserDeletedEvent } from '../../../domain/events/user-deleted.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Deleted Event Handler
 *
 * Handles the UserDeletedEvent and publishes it to Kafka.
 */
@Injectable()
@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserDeletedHandler.name);
  }

  async handle(event: UserDeletedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserDeletedEvent: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          authId: event.authId,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'user-events',
        {
          type: 'UserDeleted',
          userId: event.userId,
          authId: event.authId,
          timestamp: event.timestamp,
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserDeletedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserDeletedEvent to Kafka',
        {
          source: UserDeletedHandler.name,
          method: 'handle',
          userId: event.userId,
          authId: event.authId,
        },
      );
    }
  }
}
