import { Message } from '../../domain/entities/message.entity';
import { Conversation } from '../../domain/entities/conversation.entity';

/**
 * Message Sent Event
 *
 * Domain event published when a message is sent.
 * Follows the event-driven architecture patterns.
 */
export class MessageSentEvent {
  constructor(
    public readonly message: Message,
    public readonly conversation: Conversation,
  ) {}
}
