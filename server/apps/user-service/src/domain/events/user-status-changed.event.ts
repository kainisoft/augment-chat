import { DomainEvent } from '@app/events';

/**
 * User Status Changed Event
 *
 * Event emitted when a user's status changes.
 */
export class UserStatusChangedEvent implements DomainEvent {
  public readonly type = 'UserStatusChanged';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
