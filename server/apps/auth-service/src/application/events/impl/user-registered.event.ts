import { UserRegisteredEvent as IUserRegisteredEvent } from '@app/events';

/**
 * User Registered Event
 *
 * Event triggered when a new user is registered
 */
export class UserRegisteredEvent implements IUserRegisteredEvent {
  public readonly type = 'UserRegistered';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
