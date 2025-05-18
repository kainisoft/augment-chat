/**
 * Update User Status Command
 *
 * Command to update a user's status (online, offline, away, etc.).
 */
export class UpdateUserStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly status: string,
  ) {}
}
