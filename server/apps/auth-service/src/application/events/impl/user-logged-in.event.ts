/**
 * User Logged In Event
 *
 * Event triggered when a user successfully logs in
 */
export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
