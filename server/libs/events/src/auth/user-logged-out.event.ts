import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Logged Out Event Interface
 *
 * Event published when a user logs out.
 */
export interface UserLoggedOutEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserLoggedOut';

  /**
   * User ID
   */
  userId: string;

  /**
   * Session ID that was logged out
   */
  sessionId?: string;
}
