/**
 * Delete Message Command
 *
 * Command for deleting a message.
 */
export class DeleteMessageCommand {
  constructor(
    public readonly messageId: string,
    public readonly senderId: string,
  ) {}
}
