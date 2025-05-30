import { DomainEvent } from '../interfaces/event.interface';

/**
 * Session Terminated Event Interface
 *
 * Event published when a user session is terminated.
 */
export interface SessionTerminatedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'SessionTerminated';

  /**
   * User ID
   */
  userId: string;

  /**
   * Session ID that was terminated
   */
  sessionId: string;

  /**
   * Reason for termination
   */
  reason: string;
}
