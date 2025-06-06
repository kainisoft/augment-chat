import { DomainEvent } from '@app/events';

/**
 * Message Delivered Event
 *
 * Domain event published when a message is marked as delivered to a user.
 */
export class MessageDeliveredEvent implements DomainEvent {
  public readonly type = 'MessageDelivered';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly messageId: string,
    public readonly userId: string,
    public readonly conversationId: string,
    public readonly deliveredAt: Date,
  ) {
    this.aggregateId = messageId;
    this.timestamp = deliveredAt.getTime();
  }
}
