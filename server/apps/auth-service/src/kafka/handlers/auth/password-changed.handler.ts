import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { KafkaProducerService } from '../../kafka-producer.service';
import { PasswordChangedEvent } from '../../../application/events/impl/password-changed.event';

/**
 * Password Changed Kafka Event Handler
 *
 * Publishes PasswordChangedEvent to Kafka
 */
@Injectable()
@EventsHandler(PasswordChangedEvent)
export class PasswordChangedKafkaHandler
  implements IEventHandler<PasswordChangedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(PasswordChangedKafkaHandler.name);
  }

  async handle(event: PasswordChangedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Publishing PasswordChangedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'PasswordChanged',
          payload: {
            userId: event.userId,
            timestamp: event.timestamp.toISOString(),
          },
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published PasswordChangedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish PasswordChangedEvent to Kafka',
        {
          source: PasswordChangedKafkaHandler.name,
          method: 'handle',
          userId: event.userId,
        },
      );
    }
  }
}
