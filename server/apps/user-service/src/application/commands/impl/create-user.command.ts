/**
 * Create User Command
 *
 * Command to create a new user profile in the system.
 * This is typically triggered when a new user is registered in the Auth Service.
 */
export class CreateUserCommand {
  constructor(
    public readonly authId: string,
    public readonly username: string,
    public readonly displayName?: string,
  ) {}
}
