import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Created Event Interface
 *
 * Event published when a new user profile is created.
 */
export interface UserCreatedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserCreated';

  /**
   * User ID
   */
  userId: string;

  /**
   * Auth ID (from auth service)
   */
  authId: string;

  /**
   * Username
   */
  username: string;
}
