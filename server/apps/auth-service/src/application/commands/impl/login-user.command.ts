/**
 * Login User Command
 *
 * Command to authenticate a user and generate tokens
 */
export class LoginUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
  ) {}
}
