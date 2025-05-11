/**
 * Register User Command
 *
 * Command to register a new user in the system
 */
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
  ) {}
}
