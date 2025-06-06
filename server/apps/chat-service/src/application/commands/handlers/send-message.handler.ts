import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SendMessageCommand } from '../send-message.command';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { Message } from '../../../domain/entities/message.entity';
import { MessageId } from '../../../domain/value-objects/message-id.vo';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { MessageContent } from '../../../domain/value-objects/message-content.vo';
import { MessageSentEvent } from '../../events/message-sent.event';

/**
 * Send Message Command Handler
 *
 * Handles the SendMessageCommand following the CQRS pattern.
 */
@CommandHandler(SendMessageCommand)
@Injectable()
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    @Inject('MessageRepository')
    private readonly messageRepository: MessageRepository,
    @Inject('ConversationRepository')
    private readonly conversationRepository: ConversationRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(SendMessageHandler.name);
  }

  async execute(command: SendMessageCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Sending message to conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          senderId: command.senderId,
          contentLength: command.content.length,
          messageType: command.messageType,
        },
      );

      // Validate conversation exists
      const conversationId = new ConversationId(command.conversationId);
      const conversation =
        await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new Error(
          `Conversation with ID ${command.conversationId} not found`,
        );
      }

      // Validate sender is participant
      const senderId = new UserId(command.senderId);
      if (!conversation.isParticipant(senderId)) {
        throw new Error(
          `User ${command.senderId} is not a participant in conversation ${command.conversationId}`,
        );
      }

      // Create message entity
      const message = new Message({
        conversationId,
        senderId,
        content: new MessageContent(command.content),
        messageType: command.messageType,
        replyTo: command.replyTo ? new MessageId(command.replyTo) : undefined,
        attachments: command.attachments || [],
      });

      // Save message
      await this.messageRepository.save(message);

      // Update conversation last message
      conversation.updateLastMessage(message.getId(), new Date());
      await this.conversationRepository.save(conversation);

      // Publish domain event
      await this.eventBus.publish(new MessageSentEvent(message, conversation));

      this.loggingService.debug(
        `Message sent successfully to conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          messageId: message.getId().toString(),
          senderId: command.senderId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error sending message to conversation: ${command.conversationId}`,
        {
          source: SendMessageHandler.name,
          method: 'execute',
          conversationId: command.conversationId,
          senderId: command.senderId,
        },
      );
      throw error;
    }
  }
}
