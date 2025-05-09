import { BaseEvent } from './event.interfaces';

/**
 * Event metadata
 */
export interface EventMetadata {
  /**
   * Event type
   */
  type: string;

  /**
   * Event description
   */
  description?: string;
}

/**
 * Event registry
 */
export class EventRegistry {
  private static events: Map<string, EventMetadata> = new Map();

  /**
   * Register an event
   * @param target Event class
   * @param metadata Event metadata
   */
  static registerEvent(target: any, metadata: EventMetadata): void {
    this.events.set(target.name, metadata);
  }

  /**
   * Get event metadata
   * @param target Event class
   * @returns Event metadata
   */
  static getEventMetadata(target: any): EventMetadata | undefined {
    return this.events.get(target.name);
  }

  /**
   * Get all registered events
   * @returns Map of event name to metadata
   */
  static getAllEvents(): Map<string, EventMetadata> {
    return this.events;
  }
}

/**
 * Event decorator
 * @param metadata Event metadata
 * @returns Class decorator
 */
export function Event(metadata: EventMetadata) {
  return function <T extends { new (...args: any[]): BaseEvent }>(
    constructor: T,
  ) {
    // Register the event
    EventRegistry.registerEvent(constructor, metadata);

    // Add the type to the prototype
    constructor.prototype.type = metadata.type;

    return constructor;
  };
}
