/**
 * Get User Sessions Command
 *
 * Command to retrieve all active sessions for a user
 */
export class GetUserSessionsCommand {
  constructor(
    public readonly userId: string,
    public readonly currentSessionId?: string,
  ) {}
}
