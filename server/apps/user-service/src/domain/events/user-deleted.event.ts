/**
 * User Deleted Event
 *
 * Event emitted when a user is deleted.
 */
export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly authId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
