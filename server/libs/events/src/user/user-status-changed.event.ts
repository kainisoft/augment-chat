import { DomainEvent } from '../interfaces/event.interface';

/**
 * User Status Changed Event Interface
 *
 * Event published when a user's status changes.
 */
export interface UserStatusChangedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'UserStatusChanged';

  /**
   * User ID
   */
  userId: string;

  /**
   * Previous status
   */
  previousStatus: string;

  /**
   * New status
   */
  newStatus: string;
}
