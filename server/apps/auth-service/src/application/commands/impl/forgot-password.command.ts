/**
 * Forgot Password Command
 *
 * Command to initiate the password reset process
 */
export class ForgotPasswordCommand {
  constructor(public readonly email: string) {}
}
