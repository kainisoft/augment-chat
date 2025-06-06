/**
 * User ID Value Object
 *
 * Represents a unique identifier for a user.
 */
export class UserId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    this.value = value.trim();
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
