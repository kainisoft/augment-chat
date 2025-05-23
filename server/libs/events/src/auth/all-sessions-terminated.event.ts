import { DomainEvent } from '../interfaces/event.interface';

/**
 * All Sessions Terminated Event Interface
 *
 * Event published when all sessions for a user are terminated.
 */
export interface AllSessionsTerminatedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'AllSessionsTerminated';

  /**
   * User ID
   */
  userId: string;

  /**
   * Current session ID that was preserved
   */
  currentSessionId: string;

  /**
   * Number of sessions that were terminated
   */
  terminatedCount: number;
}
