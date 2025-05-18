import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { KafkaProducerService } from '../../kafka-producer.service';
import { UserLoggedInEvent } from '../../../application/events/impl/user-logged-in.event';

/**
 * User Logged In Kafka Event Handler
 *
 * Publishes UserLoggedInEvent to Kafka
 */
@Injectable()
@EventsHandler(UserLoggedInEvent)
export class UserLoggedInKafkaHandler
  implements IEventHandler<UserLoggedInEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserLoggedInKafkaHandler.name);
  }

  async handle(event: UserLoggedInEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Publishing UserLoggedInEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          email: event.email,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'UserLoggedIn',
          payload: {
            userId: event.userId,
            email: event.email,
            ip: event.ip,
            userAgent: event.userAgent,
            timestamp: event.timestamp.toISOString(),
          },
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserLoggedInEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserLoggedInEvent to Kafka',
        {
          source: UserLoggedInKafkaHandler.name,
          method: 'handle',
          userId: event.userId,
          email: event.email,
        },
      );
    }
  }
}
