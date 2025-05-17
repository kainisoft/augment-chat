/**
 * All Sessions Terminated Event
 *
 * Event published when all sessions for a user are terminated
 */
export class AllSessionsTerminatedEvent {
  constructor(
    public readonly userId: string,
    public readonly currentSessionId: string,
    public readonly terminatedCount: number,
  ) {}
}
