/**
 * Mark Message Delivered Command
 *
 * Command for marking a message as delivered to a specific user.
 */
export class MarkMessageDeliveredCommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
  ) {}
}
