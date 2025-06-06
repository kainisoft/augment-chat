/**
 * Participants Removed Event
 *
 * Domain event published when participants are removed from a group conversation.
 */
export class ParticipantsRemovedEvent {
  constructor(
    public readonly conversationId: string,
    public readonly removedParticipants: string[],
    public readonly removedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
