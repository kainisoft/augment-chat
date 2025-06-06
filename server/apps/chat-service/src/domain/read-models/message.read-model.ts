import { MessageId } from '../value-objects/message-id.vo';
import { ConversationId } from '../value-objects/conversation-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Message Read Model
 *
 * Read-only representation of a message for queries.
 */
export class MessageReadModel {
  constructor(
    public readonly id: MessageId,
    public readonly conversationId: ConversationId,
    public readonly senderId: UserId,
    public readonly content: string,
    public readonly messageType: 'text' | 'image' | 'file' | 'system',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly replyTo?: MessageId,
    public readonly attachments?: string[],
    public readonly deliveredTo?: UserId[],
    public readonly readBy?: UserId[],
  ) {}
}
