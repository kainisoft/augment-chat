/**
 * User Logged Out Event
 *
 * Event triggered when a user logs out
 */
export class UserLoggedOutEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
