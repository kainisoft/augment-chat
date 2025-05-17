/**
 * Terminate Session Command
 *
 * Command to terminate a specific session
 */
export class TerminateSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly currentSessionId?: string,
  ) {}
}
