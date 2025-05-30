import { PasswordChangedEvent as IPasswordChangedEvent } from '@app/events';

/**
 * Password Changed Event
 *
 * Event triggered when a user's password is changed
 */
export class PasswordChangedEvent implements IPasswordChangedEvent {
  public readonly type = 'PasswordChanged';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
