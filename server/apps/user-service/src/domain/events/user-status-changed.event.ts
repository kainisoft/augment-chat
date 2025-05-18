/**
 * User Status Changed Event
 *
 * Event emitted when a user's status changes.
 */
export class UserStatusChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
