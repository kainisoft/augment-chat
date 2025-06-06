/**
 * Send Message Command
 *
 * Command for sending a new message to a conversation.
 */
export class SendMessageCommand {
  constructor(
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly messageType: 'text' | 'image' | 'file' | 'system' = 'text',
    public readonly replyTo?: string,
    public readonly attachments?: string[],
  ) {}
}
