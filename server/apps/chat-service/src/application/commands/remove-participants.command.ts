/**
 * Remove Participants Command
 *
 * Command for removing participants from a group conversation.
 */
export class RemoveParticipantsCommand {
  constructor(
    public readonly conversationId: string,
    public readonly participants: string[],
    public readonly requesterId: string,
  ) {}
}
