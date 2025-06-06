import { DomainEvent } from '@app/events';

/**
 * Message Read Event
 *
 * Domain event published when a message is marked as read by a user.
 */
export class MessageReadEvent implements DomainEvent {
  public readonly type = 'MessageRead';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly messageId: string,
    public readonly userId: string,
    public readonly conversationId: string,
    public readonly readAt: Date,
  ) {
    this.aggregateId = messageId;
    this.timestamp = readAt.getTime();
  }
}
