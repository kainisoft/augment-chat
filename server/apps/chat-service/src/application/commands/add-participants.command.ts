/**
 * Add Participants Command
 *
 * Command for adding participants to a group conversation.
 */
export class AddParticipantsCommand {
  constructor(
    public readonly conversationId: string,
    public readonly participants: string[],
    public readonly requesterId: string,
  ) {}
}
