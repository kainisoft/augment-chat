import { UserCreatedEvent as IUserCreatedEvent } from '@app/events';

/**
 * User Created Event
 *
 * Event emitted when a new user is created.
 */
export class UserCreatedEvent implements IUserCreatedEvent {
  public readonly type = 'UserCreated';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly authId: string,
    public readonly username: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
