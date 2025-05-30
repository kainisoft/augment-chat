import { UserLoggedOutEvent as IUserLoggedOutEvent } from '@app/events';

/**
 * User Logged Out Event
 *
 * Event triggered when a user logs out
 */
export class UserLoggedOutEvent implements IUserLoggedOutEvent {
  public readonly type = 'UserLoggedOut';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly sessionId?: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
