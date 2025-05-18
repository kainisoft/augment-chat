/**
 * Update User Profile Command
 *
 * Command to update a user's profile information.
 */
export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly displayName?: string,
    public readonly bio?: string,
    public readonly avatarUrl?: string,
  ) {}
}
