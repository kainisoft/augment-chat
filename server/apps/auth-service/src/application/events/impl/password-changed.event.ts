/**
 * Password Changed Event
 *
 * Event triggered when a user's password is changed
 */
export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
