import { UserDeletedEvent as IUserDeletedEvent } from '@app/events';

/**
 * User Deleted Event
 *
 * Event emitted when a user is deleted.
 */
export class UserDeletedEvent implements IUserDeletedEvent {
  public readonly type = 'UserDeleted';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly authId: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
