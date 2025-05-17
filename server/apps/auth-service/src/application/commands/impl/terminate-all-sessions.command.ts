/**
 * Terminate All Sessions Command
 *
 * Command to terminate all sessions for a user except the current one
 */
export class TerminateAllSessionsCommand {
  constructor(
    public readonly userId: string,
    public readonly currentSessionId: string,
  ) {}
}
