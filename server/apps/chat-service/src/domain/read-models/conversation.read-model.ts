import { ConversationId } from '../value-objects/conversation-id.vo';
import { MessageId } from '../value-objects/message-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Conversation Read Model
 *
 * Read-only representation of a conversation for queries.
 */
export class ConversationReadModel {
  constructor(
    public readonly id: ConversationId,
    public readonly type: 'private' | 'group',
    public readonly participants: UserId[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly name?: string,
    public readonly description?: string,
    public readonly avatar?: string,
    public readonly lastMessageAt?: Date,
    public readonly lastMessageId?: MessageId,
  ) {}
}
