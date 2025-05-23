/**
 * Base Event Interface
 *
 * Defines the base structure for all events in the system.
 */
export interface BaseEvent {
  /**
   * Event type identifier
   */
  type: string;

  /**
   * Event timestamp
   */
  timestamp: number;
}

/**
 * Domain Event Interface
 *
 * Extends the base event with domain-specific properties.
 */
export interface DomainEvent extends BaseEvent {
  /**
   * Aggregate ID (entity identifier)
   */
  aggregateId: string;
}
