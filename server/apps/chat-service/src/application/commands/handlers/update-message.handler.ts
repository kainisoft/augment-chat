import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UpdateMessageCommand } from '../update-message.command';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageId } from '../../../domain/value-objects/message-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { MessageContent } from '../../../domain/value-objects/message-content.vo';

/**
 * Update Message Command Handler
 *
 * Handles the UpdateMessageCommand following the CQRS pattern.
 */
@CommandHandler(UpdateMessageCommand)
@Injectable()
export class UpdateMessageHandler
  implements ICommandHandler<UpdateMessageCommand>
{
  constructor(
    @Inject('MessageRepository')
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UpdateMessageHandler.name);
  }

  async execute(command: UpdateMessageCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Updating message: ${command.messageId}`,
        'execute',
        {
          messageId: command.messageId,
          senderId: command.senderId,
          contentLength: command.content.length,
        },
      );

      // Find the message
      const messageId = new MessageId(command.messageId);
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new Error(`Message with ID ${command.messageId} not found`);
      }

      // Validate sender can edit the message
      const senderId = new UserId(command.senderId);
      if (!message.canBeEditedBy(senderId)) {
        throw new Error(
          `User ${command.senderId} is not authorized to edit message ${command.messageId}`,
        );
      }

      // Update message content
      const newContent = new MessageContent(command.content);
      message.updateContent(newContent);

      // Save updated message
      await this.messageRepository.save(message);

      this.loggingService.debug(
        `Message updated successfully: ${command.messageId}`,
        'execute',
        {
          messageId: command.messageId,
          senderId: command.senderId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating message: ${command.messageId}`,
        {
          source: UpdateMessageHandler.name,
          method: 'execute',
          messageId: command.messageId,
          senderId: command.senderId,
        },
      );
      throw error;
    }
  }
}
