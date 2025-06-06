import { Conversation } from '../entities/conversation.entity';
import { ConversationId } from '../value-objects/conversation-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Conversation Repository Interface
 *
 * Repository interface for conversation write operations.
 */
export interface ConversationRepository {
  /**
   * Save a conversation (create or update)
   */
  save(conversation: Conversation): Promise<void>;

  /**
   * Find a conversation by ID
   */
  findById(id: ConversationId): Promise<Conversation | null>;

  /**
   * Delete a conversation
   */
  delete(id: ConversationId): Promise<void>;

  /**
   * Check if a conversation exists
   */
  exists(id: ConversationId): Promise<boolean>;

  /**
   * Find private conversation between two users
   */
  findPrivateConversation(participants: UserId[]): Promise<Conversation | null>;

  /**
   * Find conversations for a user
   */
  findByParticipant(userId: UserId): Promise<Conversation[]>;
}
