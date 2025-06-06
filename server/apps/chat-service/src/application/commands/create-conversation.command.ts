/**
 * Create Conversation Command
 *
 * Command for creating a new conversation (private or group).
 */
export class CreateConversationCommand {
  constructor(
    public readonly type: 'private' | 'group',
    public readonly participants: string[],
    public readonly creatorId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly avatar?: string,
  ) {}
}
