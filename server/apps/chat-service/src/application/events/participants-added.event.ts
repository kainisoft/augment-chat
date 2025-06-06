/**
 * Participants Added Event
 *
 * Domain event published when participants are added to a group conversation.
 */
export class ParticipantsAddedEvent {
  constructor(
    public readonly conversationId: string,
    public readonly addedParticipants: string[],
    public readonly addedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
