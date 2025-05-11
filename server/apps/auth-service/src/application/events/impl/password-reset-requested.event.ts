/**
 * Password Reset Requested Event
 *
 * Event triggered when a user requests a password reset
 */
export class PasswordResetRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
