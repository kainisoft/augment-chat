import { SessionTerminatedEvent as ISessionTerminatedEvent } from '@app/events';

/**
 * Session Terminated Event
 *
 * Event published when a session is terminated
 */
export class SessionTerminatedEvent implements ISessionTerminatedEvent {
  public readonly type = 'SessionTerminated';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly reason: string,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
