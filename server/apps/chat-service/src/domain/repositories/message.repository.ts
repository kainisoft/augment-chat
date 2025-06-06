import { Message } from '../entities/message.entity';
import { MessageId } from '../value-objects/message-id.vo';
import { ConversationId } from '../value-objects/conversation-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Message Repository Interface
 *
 * Repository interface for message write operations.
 */
export interface MessageRepository {
  /**
   * Save a message (create or update)
   */
  save(message: Message): Promise<void>;

  /**
   * Find a message by ID
   */
  findById(id: MessageId): Promise<Message | null>;

  /**
   * Delete a message
   */
  delete(id: MessageId): Promise<void>;

  /**
   * Check if a message exists
   */
  exists(id: MessageId): Promise<boolean>;

  /**
   * Find messages by conversation ID
   */
  findByConversationId(conversationId: ConversationId): Promise<Message[]>;

  /**
   * Mark message as delivered to user
   */
  markAsDelivered(messageId: MessageId, userId: UserId): Promise<void>;

  /**
   * Mark message as read by user
   */
  markAsRead(messageId: MessageId, userId: UserId): Promise<void>;
}
