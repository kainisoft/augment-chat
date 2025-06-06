import { MessageReadModel } from '../read-models/message.read-model';
import { MessageId } from '../value-objects/message-id.vo';
import { ConversationId } from '../value-objects/conversation-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Message Read Repository Interface
 *
 * Repository interface for message read operations.
 */
export interface MessageReadRepository {
  /**
   * Find a message by ID
   */
  findById(id: MessageId): Promise<MessageReadModel | null>;

  /**
   * Find messages by conversation ID with pagination
   */
  findByConversationId(
    conversationId: ConversationId,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    },
  ): Promise<MessageReadModel[]>;

  /**
   * Search messages by content
   */
  searchByContent(
    query: string,
    userId: UserId,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<MessageReadModel[]>;

  /**
   * Count messages in conversation
   */
  countByConversationId(conversationId: ConversationId): Promise<number>;

  /**
   * Get unread message count for user in conversation
   */
  getUnreadCount(
    conversationId: ConversationId,
    userId: UserId,
  ): Promise<number>;
}
