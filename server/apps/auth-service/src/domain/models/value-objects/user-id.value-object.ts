import { randomUUID } from 'crypto';

/**
 * UserId Value Object
 *
 * Represents a unique identifier for a user in the system.
 */
export class UserId {
  private readonly value: string;

  /**
   * Create a new UserId value object
   * @param id - The user ID string (optional, generates a new UUID if not provided)
   */
  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  /**
   * Check if this user ID equals another user ID
   * @param id - The user ID to compare with
   * @returns True if the user IDs are equal, false otherwise
   */
  equals(id: UserId): boolean {
    return this.value === id.value;
  }

  /**
   * Get the string representation of the user ID
   * @returns The user ID as a string
   */
  toString(): string {
    return this.value;
  }
}
