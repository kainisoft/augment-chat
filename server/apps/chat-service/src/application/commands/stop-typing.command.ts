/**
 * Stop Typing Command
 *
 * Command for stopping typing indicator in a conversation.
 */
export class StopTypingCommand {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
  ) {}
}
