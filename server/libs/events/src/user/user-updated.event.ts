import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Updated Event Interface
 *
 * Event published when a user profile is updated.
 */
export interface UserUpdatedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserUpdated';

  /**
   * User ID
   */
  userId: string;

  /**
   * Updated fields
   */
  updatedFields: string[];
}
