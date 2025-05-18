/**
 * User Created Event
 *
 * Event emitted when a new user is created.
 */
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly authId: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
