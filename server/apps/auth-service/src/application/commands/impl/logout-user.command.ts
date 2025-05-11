/**
 * Logout User Command
 *
 * Command to log out a user and invalidate their tokens
 */
export class LogoutUserCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly userId?: string,
  ) {}
}
