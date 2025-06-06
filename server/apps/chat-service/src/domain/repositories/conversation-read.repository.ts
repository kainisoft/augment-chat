import { ConversationReadModel } from '../read-models/conversation.read-model';
import { ConversationId } from '../value-objects/conversation-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Conversation Read Repository Interface
 *
 * Repository interface for conversation read operations.
 */
export interface ConversationReadRepository {
  /**
   * Find a conversation by ID
   */
  findById(id: ConversationId): Promise<ConversationReadModel | null>;

  /**
   * Find conversations for a user with pagination
   */
  findByParticipant(
    userId: UserId,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    },
  ): Promise<ConversationReadModel[]>;

  /**
   * Find private conversation between two users
   */
  findPrivateConversation(
    participants: UserId[],
  ): Promise<ConversationReadModel | null>;

  /**
   * Search conversations by name
   */
  searchByName(
    query: string,
    userId: UserId,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<ConversationReadModel[]>;

  /**
   * Count conversations for user
   */
  countByParticipant(userId: UserId): Promise<number>;
}
