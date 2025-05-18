import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserCreatedEvent } from '../../../domain/events/user-created.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Created Event Handler
 *
 * Handles the UserCreatedEvent and publishes it to Kafka.
 */
@Injectable()
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserCreatedHandler.name);
  }

  async handle(event: UserCreatedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserCreatedEvent: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          authId: event.authId,
          username: event.username,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'user-events',
        {
          type: 'UserCreated',
          userId: event.userId,
          authId: event.authId,
          username: event.username,
          timestamp: event.timestamp,
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserCreatedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserCreatedEvent to Kafka',
        {
          source: UserCreatedHandler.name,
          method: 'handle',
          userId: event.userId,
          authId: event.authId,
          username: event.username,
        },
      );
    }
  }
}
