import { Conversation } from '../../domain/entities/conversation.entity';

/**
 * Conversation Created Event
 *
 * Domain event published when a conversation is created.
 * Follows the event-driven architecture patterns.
 */
export class ConversationCreatedEvent {
  constructor(public readonly conversation: Conversation) {}
}
