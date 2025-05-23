import { DomainEvent } from '../interfaces/event.interface';

/**
 * Password Changed Event Interface
 *
 * Event published when a user changes their password.
 */
export interface PasswordChangedEvent extends DomainEvent {
  /**
   * Event type
   */
  type: 'PasswordChanged';

  /**
   * User ID
   */
  userId: string;
}
