import { AllSessionsTerminatedEvent as IAllSessionsTerminatedEvent } from '@app/events';

/**
 * All Sessions Terminated Event
 *
 * Event published when all sessions for a user are terminated
 */
export class AllSessionsTerminatedEvent implements IAllSessionsTerminatedEvent {
  public readonly type = 'AllSessionsTerminated';
  public readonly aggregateId: string;
  public readonly timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly currentSessionId: string,
    public readonly terminatedCount: number,
    timestamp?: Date,
  ) {
    this.aggregateId = userId;
    this.timestamp = timestamp ? timestamp.getTime() : Date.now();
  }
}
