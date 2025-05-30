import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Profile Updated Event Interface
 *
 * Event published when a user profile is updated.
 */
export interface UserProfileUpdatedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserProfileUpdated';

  /**
   * User ID
   */
  userId: string;

  /**
   * Updated fields
   */
  updatedFields: string[];
}
