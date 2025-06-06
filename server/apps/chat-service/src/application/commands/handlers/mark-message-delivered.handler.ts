import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { MarkMessageDeliveredCommand } from '../mark-message-delivered.command';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageId } from '../../../domain/value-objects/message-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { MessageDeliveredEvent } from '../../events/message-delivered.event';

/**
 * Mark Message Delivered Command Handler
 *
 * Handles the MarkMessageDeliveredCommand following the CQRS pattern.
 */
@CommandHandler(MarkMessageDeliveredCommand)
@Injectable()
export class MarkMessageDeliveredHandler
  implements ICommandHandler<MarkMessageDeliveredCommand>
{
  constructor(
    @Inject('MessageRepository')
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MarkMessageDeliveredHandler.name);
  }

  async execute(command: MarkMessageDeliveredCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Marking message as delivered: ${command.messageId} for user: ${command.userId}`,
        'execute',
        {
          messageId: command.messageId,
          userId: command.userId,
        },
      );

      // Verify the message exists
      const messageId = new MessageId(command.messageId);
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new Error(`Message with ID ${command.messageId} not found`);
      }

      // Mark as delivered using repository method (updates MongoDB directly)
      const userId = new UserId(command.userId);
      await this.messageRepository.markAsDelivered(messageId, userId);

      // Publish domain event for real-time updates
      await this.eventBus.publish(
        new MessageDeliveredEvent(
          command.messageId,
          command.userId,
          message.getConversationId().toString(),
          new Date(),
        ),
      );

      this.loggingService.debug(
        `Message marked as delivered successfully: ${command.messageId} for user: ${command.userId}`,
        'execute',
        {
          messageId: command.messageId,
          userId: command.userId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error marking message as delivered: ${command.messageId}`,
        {
          source: MarkMessageDeliveredHandler.name,
          method: 'execute',
          messageId: command.messageId,
          userId: command.userId,
        },
      );
      throw error;
    }
  }
}
