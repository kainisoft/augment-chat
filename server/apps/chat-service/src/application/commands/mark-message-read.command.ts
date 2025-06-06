/**
 * Mark Message Read Command
 *
 * Command for marking a message as read by a specific user.
 */
export class MarkMessageReadCommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
  ) {}
}
