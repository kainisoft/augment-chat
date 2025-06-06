import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { StartTypingCommand } from '../start-typing.command';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import {
  SubscriptionService,
  TypingEvent,
} from '../../../graphql/services/subscription.service';

/**
 * Start Typing Command Handler
 *
 * Handles the StartTypingCommand following the CQRS pattern.
 */
@CommandHandler(StartTypingCommand)
@Injectable()
export class StartTypingHandler implements ICommandHandler<StartTypingCommand> {
  constructor(
    @Inject('ConversationRepository')
    private readonly conversationRepository: ConversationRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(StartTypingHandler.name);
  }

  async execute(command: StartTypingCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Starting typing indicator for user: ${command.userId} in conversation: ${command.conversationId}`,
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
        type: 'typing.started',
        timestamp: Date.now(),
        conversationId: command.conversationId,
        userId: command.userId,
        data: {
          conversationId: command.conversationId,
          userId: command.userId,
          displayName: command.userId, // TODO: Get actual display name from user service
          isTyping: true,
          timestamp: new Date(),
        },
      };

      // Publish typing event for real-time subscriptions
      await this.subscriptionService.publishTypingEvent(typingEvent);

      this.loggingService.debug(
        `Typing indicator started successfully for user: ${command.userId} in conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          userId: command.userId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error starting typing indicator for user: ${command.userId} in conversation: ${command.conversationId}`,
        {
          source: StartTypingHandler.name,
          method: 'execute',
          conversationId: command.conversationId,
          userId: command.userId,
        },
      );
      throw error;
    }
  }
}
