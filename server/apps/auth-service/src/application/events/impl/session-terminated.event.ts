/**
 * Session Terminated Event
 *
 * Event published when a session is terminated
 */
export class SessionTerminatedEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly reason: string,
  ) {}
}
