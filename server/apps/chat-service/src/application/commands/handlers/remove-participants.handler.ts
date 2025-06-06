import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { RemoveParticipantsCommand } from '../remove-participants.command';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { ParticipantsRemovedEvent } from '../../events/participants-removed.event';

/**
 * Remove Participants Command Handler
 *
 * Handles the RemoveParticipantsCommand following the CQRS pattern.
 */
@CommandHandler(RemoveParticipantsCommand)
@Injectable()
export class RemoveParticipantsHandler
  implements ICommandHandler<RemoveParticipantsCommand>
{
  constructor(
    @Inject('ConversationRepository')
    private readonly conversationRepository: ConversationRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(RemoveParticipantsHandler.name);
  }

  async execute(command: RemoveParticipantsCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Removing participants from conversation: ${command.conversationId}`,
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
        throw new Error(
          'Cannot remove participants from private conversations',
        );
      }

      // Validate requester is a participant
      const requesterId = new UserId(command.requesterId);
      if (!conversation.isParticipant(requesterId)) {
        throw new Error(
          `User ${command.requesterId} is not authorized to remove participants from this conversation`,
        );
      }

      // Validate we're not removing all participants
      const currentParticipants = conversation.getParticipants();
      const participantsToRemove = command.participants.map(
        (id) => new UserId(id),
      );
      const remainingParticipants = currentParticipants.filter(
        (participant) =>
          !participantsToRemove.some((toRemove) =>
            toRemove.equals(participant),
          ),
      );

      if (remainingParticipants.length === 0) {
        throw new Error(
          'Cannot remove all participants from a group conversation',
        );
      }

      // Remove participants
      for (const participant of participantsToRemove) {
        conversation.removeParticipant(participant);
      }

      // Save the updated conversation
      await this.conversationRepository.save(conversation);

      this.loggingService.debug(
        `Successfully removed ${command.participants.length} participants from conversation: ${command.conversationId}`,
        'execute',
        {
          conversationId: command.conversationId,
          removedParticipants: command.participants,
          requesterId: command.requesterId,
        },
      );

      // Publish domain event
      this.eventBus.publish(
        new ParticipantsRemovedEvent(
          conversation.getId().toString(),
          command.participants,
          command.requesterId,
        ),
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error removing participants from conversation: ${command.conversationId}`,
        {
          source: RemoveParticipantsHandler.name,
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
