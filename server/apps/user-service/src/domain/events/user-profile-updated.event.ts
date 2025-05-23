import { UserUpdatedEvent } from '@app/events';

/**
 * User Profile Updated Event
 *
 * Event emitted when a user's profile is updated.
 */
export class UserProfileUpdatedEvent implements UserUpdatedEvent {
  public readonly type = 'UserUpdated';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly updatedFields: string[],
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
