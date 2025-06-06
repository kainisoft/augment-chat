import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { AddParticipantsCommand } from '../add-participants.command';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { ParticipantsAddedEvent } from '../../events/participants-added.event';

/**
 * Add Participants Command Handler
 *
 * Handles the AddParticipantsCommand following the CQRS pattern.
 */
@CommandHandler(AddParticipantsCommand)
@Injectable()
export class AddParticipantsHandler
  implements ICommandHandler<AddParticipantsCommand>
{
  constructor(
    @Inject('ConversationRepository')
    private readonly conversationRepository: ConversationRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(AddParticipantsHandler.name);
  }

  async execute(command: AddParticipantsCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Adding participants to conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          participantCount: command.participants.length,
          requesterId: command.requesterId,
        },
      );

      // Validate input
      if (command.participants.length === 0) {
        throw new Error('At least one participant must be specified');
      }

      // Find the conversation
      const conversationId = new ConversationId(command.conversationId);
      const conversation =
        await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new Error(
          `Conversation with ID ${command.conversationId} not found`,
        );
      }

      // Validate conversation is a group
      if (conversation.getType() !== 'group') {
        throw new Error('Cannot add participants to private conversations');
      }

      // Validate requester is a participant
      const requesterId = new UserId(command.requesterId);
      if (!conversation.isParticipant(requesterId)) {
        throw new Error(
          `User ${command.requesterId} is not authorized to add participants to this conversation`,
        );
      }

      // Add participants
      const participantsToAdd = command.participants.map(
        (id) => new UserId(id),
      );
      for (const participant of participantsToAdd) {
        conversation.addParticipant(participant);
      }

      // Save the updated conversation
      await this.conversationRepository.save(conversation);

      this.loggingService.debug(
        `Successfully added ${command.participants.length} participants to conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          addedParticipants: command.participants,
          requesterId: command.requesterId,
        },
      );

      // Publish domain event
      this.eventBus.publish(
        new ParticipantsAddedEvent(
          conversation.getId().toString(),
          command.participants,
          command.requesterId,
        ),
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error adding participants to conversation: ${command.conversationId}`,
        {
          source: AddParticipantsHandler.name,
          method: 'execute',
          conversationId: command.conversationId,
          participantCount: command.participants.length,
          requesterId: command.requesterId,
        },
      );
      throw error;
    }
  }
}
