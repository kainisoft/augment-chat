/**
 * User Profile Updated Event
 *
 * Event emitted when a user's profile is updated.
 */
export class UserProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly updatedFields: string[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
