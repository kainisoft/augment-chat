import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { MessageDeliveredEvent } from '../message-delivered.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * Message Delivered Event Handler
 *
 * Handles MessageDeliveredEvent for real-time notifications and Kafka publishing.
 */
@EventsHandler(MessageDeliveredEvent)
@Injectable()
export class MessageDeliveredHandler
  implements IEventHandler<MessageDeliveredEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {
    this.loggingService.setContext(MessageDeliveredHandler.name);
  }

  async handle(event: MessageDeliveredEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling MessageDeliveredEvent for message: ${event.messageId}`,
        'handle',
        {
          messageId: event.messageId,
          userId: event.userId,
          conversationId: event.conversationId,
          deliveredAt: event.deliveredAt,
        },
      );

      // Publish event to Kafka for inter-service communication
      await this.kafkaProducerService.send(
        'chat-events',
        event,
        event.messageId,
      );

      this.loggingService.log(
        `Message ${event.messageId} marked as delivered to user ${event.userId}`,
        'handle',
        {
          messageId: event.messageId,
          userId: event.userId,
          conversationId: event.conversationId,
        },
      );

      this.loggingService.debug(
        `Published MessageDeliveredEvent to Kafka: ${event.messageId}`,
        'handle',
        { messageId: event.messageId, userId: event.userId },
      );

      // TODO: Implement real-time notification via WebSocket subscriptions
      // TODO: Update conversation unread counts
      // TODO: Send push notifications if user is offline
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle MessageDeliveredEvent',
        {
          source: MessageDeliveredHandler.name,
          method: 'handle',
          messageId: event.messageId,
          userId: event.userId,
          conversationId: event.conversationId,
        },
      );
    }
  }
}
