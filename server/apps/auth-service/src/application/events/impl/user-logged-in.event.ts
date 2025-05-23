import { UserLoggedInEvent as IUserLoggedInEvent } from '@app/events';

/**
 * User Logged In Event
 *
 * Event triggered when a user successfully logs in
 */
export class UserLoggedInEvent implements IUserLoggedInEvent {
  public readonly type = 'UserLoggedIn';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
