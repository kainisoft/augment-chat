import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Registered Event Interface
 *
 * Event published when a new user is registered.
 */
export interface UserRegisteredEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserRegistered';

  /**
   * User ID
   */
  userId: string;

  /**
   * User email
   */
  email: string;
}
