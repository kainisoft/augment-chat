/**
 * Start Typing Command
 *
 * Command for starting typing indicator in a conversation.
 */
export class StartTypingCommand {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
  ) {}
}
