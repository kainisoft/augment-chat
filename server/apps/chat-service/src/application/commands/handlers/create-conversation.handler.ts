import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { CreateConversationCommand } from '../create-conversation.command';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { ConversationCreatedEvent } from '../../events/conversation-created.event';

/**
 * Create Conversation Command Handler
 *
 * Handles the CreateConversationCommand following the CQRS pattern.
 */
@CommandHandler(CreateConversationCommand)
@Injectable()
export class CreateConversationHandler
  implements ICommandHandler<CreateConversationCommand>
{
  constructor(
    @Inject('ConversationRepository')
    private readonly conversationRepository: ConversationRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(CreateConversationHandler.name);
  }

  async execute(command: CreateConversationCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Creating ${command.type} conversation`,
        'execute',
        {
          type: command.type,
          participantCount: command.participants.length,
          creatorId: command.creatorId,
          name: command.name,
        },
      );

      // Validate participants
      if (command.participants.length < 1) {
        throw new Error('Conversation must have at least one participant');
      }

      // For private conversations, ensure exactly 2 participants
      if (command.type === 'private' && command.participants.length !== 2) {
        throw new Error(
          'Private conversations must have exactly 2 participants',
        );
      }

      // Ensure creator is included in participants
      if (!command.participants.includes(command.creatorId)) {
        command.participants.push(command.creatorId);
      }

      // Check for existing private conversation
      if (command.type === 'private') {
        const existingConversation =
          await this.conversationRepository.findPrivateConversation(
            command.participants.map((id) => new UserId(id)),
          );
        if (existingConversation) {
          throw new Error(
            'Private conversation already exists between these participants',
          );
        }
      }

      // Create conversation entity
      const conversation = new Conversation({
        type: command.type,
        participants: command.participants.map((id) => new UserId(id)),
        name: command.name,
        description: command.description,
        avatar: command.avatar,
      });

      // Save conversation
      await this.conversationRepository.save(conversation);

      // Publish domain event
      await this.eventBus.publish(new ConversationCreatedEvent(conversation));

      this.loggingService.debug(
        `Conversation created successfully`,
        'execute',
        {
          conversationId: conversation.getId().toString(),
          type: command.type,
          participantCount: command.participants.length,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error creating ${command.type} conversation`,
        {
          source: CreateConversationHandler.name,
          method: 'execute',
          type: command.type,
          participantCount: command.participants.length,
          creatorId: command.creatorId,
        },
      );
      throw error;
    }
  }
}
