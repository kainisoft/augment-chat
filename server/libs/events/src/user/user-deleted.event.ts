import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Deleted Event Interface
 *
 * Event published when a user profile is deleted.
 */
export interface UserDeletedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserDeleted';

  /**
   * User ID
   */
  userId: string;

  /**
   * Auth ID (from auth service)
   */
  authId: string;
}
