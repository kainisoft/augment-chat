/**
 * Reset Password Command
 *
 * Command to reset a user's password using a reset token
 */
export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {}
}
