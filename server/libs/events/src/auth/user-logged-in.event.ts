import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Logged In Event Interface
 *
 * Event published when a user logs in.
 */
export interface UserLoggedInEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserLoggedIn';

  /**
   * User ID
   */
  userId: string;

  /**
   * User email
   */
  email: string;

  /**
   * IP address of the login
   */
  ip?: string;

  /**
   * User agent of the login
   */
  userAgent?: string;
}
