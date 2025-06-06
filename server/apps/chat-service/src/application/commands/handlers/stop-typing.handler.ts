import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { StopTypingCommand } from '../stop-typing.command';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import {
  SubscriptionService,
  TypingEvent,
} from '../../../graphql/services/subscription.service';

/**
 * Stop Typing Command Handler
 *
 * Handles the StopTypingCommand following the CQRS pattern.
 */
@CommandHandler(StopTypingCommand)
@Injectable()
export class StopTypingHandler implements ICommandHandler<StopTypingCommand> {
  constructor(
    @Inject('ConversationRepository')
    private readonly conversationRepository: ConversationRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(StopTypingHandler.name);
  }

  async execute(command: StopTypingCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Stopping typing indicator for user: ${command.userId} in conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          userId: command.userId,
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

      // Validate user is participant
      const userId = new UserId(command.userId);
      if (!conversation.isParticipant(userId)) {
        throw new Error(
          `User ${command.userId} is not a participant in conversation ${command.conversationId}`,
        );
      }

      // Create typing event
      const typingEvent: TypingEvent = {
        type: 'typing.stopped',
        timestamp: Date.now(),
        conversationId: command.conversationId,
        userId: command.userId,
        data: {
          conversationId: command.conversationId,
          userId: command.userId,
          displayName: command.userId, // TODO: Get actual display name from user service
          isTyping: false,
          timestamp: new Date(),
        },
      };

      // Publish typing event for real-time subscriptions
      await this.subscriptionService.publishTypingEvent(typingEvent);

      this.loggingService.debug(
        `Typing indicator stopped successfully for user: ${command.userId} in conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          userId: command.userId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error stopping typing indicator for user: ${command.userId} in conversation: ${command.conversationId}`,
        {
          source: StopTypingHandler.name,
          method: 'execute',
          conversationId: command.conversationId,
          userId: command.userId,
        },
      );
      throw error;
    }
  }
}
