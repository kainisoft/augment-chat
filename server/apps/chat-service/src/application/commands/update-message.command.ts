/**
 * Update Message Command
 *
 * Command for updating an existing message.
 */
export class UpdateMessageCommand {
  constructor(
    public readonly messageId: string,
    public readonly senderId: string,
    public readonly content: string,
  ) {}
}
