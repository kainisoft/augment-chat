/**
 * User Registered Event
 *
 * Event triggered when a new user is registered
 */
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
